import { existsSync } from "fs";
import { join } from "path";
import { IPluginWrapper } from "./IPluginWrapper";
import { IPlugin } from "./shared/IPlugin";

export interface PluginManagerSettings {
  pluginsPath: string;
}

export class PluginManager {

  private plugins: Map<string, IPluginWrapper>;
  private settings: PluginManagerSettings;

  constructor(settings: PluginManagerSettings) {
    this.settings = settings;
  }

  private requireModule(path: string): any {
    if (!existsSync(path)) {
      throw new Error(`Module ${path} does not exist`);
    }

    return require(path).default;
  }

  public registerPlugin(plugin: IPluginWrapper): void {
    if (!plugin.name || !plugin.packageName) {
      throw new Error("Plugin must have a name and a packageName");
    }

    if (this.pluginExists(plugin.name)) {
      throw new Error(`Plugin with name ${plugin.name} already exists`);
    }

    try {
      const pluginInstance = plugin.isRelative ? 
        this.requireModule(join(this.settings.pluginsPath, plugin.packageName)) :
        this.requireModule(join(process.cwd(), "node_modules", plugin.packageName));

        this.addPlugin(plugin, pluginInstance);
    } catch (error) {
      throw new Error(`Error loading plugin ${plugin.name}: ${error.message}`);
    }
  }

  private pluginExists(name: string): boolean {
    return this.plugins.has(name);
  }

  private addPlugin(plugin: IPluginWrapper, pluginInstance: IPlugin): void {
    this.plugins.set(plugin.name, { ...plugin, instance: pluginInstance });
  }

  public loadPlugin(name: string): IPlugin {
    if (!this.pluginExists(name)) {
      throw new Error(`Plugin with name ${name} does not exist`);
    }

    const plugin = this.plugins.get(name);
    const pluginInstance = plugin.instance as IPlugin;
    return new pluginInstance(plugin.settings);
  }

}