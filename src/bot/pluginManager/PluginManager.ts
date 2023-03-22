import { existsSync } from "fs";
import { join } from "path";
import { IPluginWrapper, IInitializedPluginWrapper, PluginInstance } from "./IPluginWrapper";
import { IClient } from "../../shared/interfaces/IClient";
import Config from "../Config"

export class PluginManager {

  private client: IClient;
  private plugins: Map<string, IInitializedPluginWrapper> = new Map();

  constructor(client: IClient) {
    this.client = client;
  }

  private requireModule(path: string): PluginInstance {
    if (!existsSync(path)) {
      throw new Error(`Module ${path} does not exist`);
    }

    return require(path).default as PluginInstance;
  }

  public registerPlugin(plugin: IPluginWrapper): void {
    if (!plugin.name || !plugin.packageName) {
      throw new Error("Plugin must have a name and a packageName");
    }

    if (this.pluginExists(plugin.name)) {
      throw new Error(`Plugin with name ${plugin.name} already exists`);
    }

    try {
      const pluginInstance = plugin.isRelative
        ? this.requireModule(
            join(Config.pluginsPath, plugin.packageName)
          )
        : this.requireModule(
            join(process.cwd(), "node_modules", plugin.packageName)
          );

      this.addPlugin(plugin, pluginInstance);
    } catch (error: any) {
      throw new Error(`Error loading plugin ${plugin.name}: ${error.message}`);
    }
  }

  private pluginExists(name: string): boolean {
    return this.plugins.has(name);
  }

  private addPlugin(plugin: IPluginWrapper, pluginInstance: PluginInstance): void {
    this.plugins.set(plugin.name, { ...plugin, instance: pluginInstance });
  }

  public loadPlugin(name: string): any {
    if (!this.pluginExists(name)) {
      throw new Error(`Plugin with name ${name} does not exist`);
    }

    const plugin = this.plugins.get(name) as IInitializedPluginWrapper;
    const pluginInstance = plugin.instance as PluginInstance;
    const protocol = {
      logger: console,
      client: this.client,
      registerCommand: this.client.registerCommand,
      registerCronjob: this.client.registerCronjob,
    }
    return new pluginInstance(protocol);
  }
}
