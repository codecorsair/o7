import { existsSync } from 'fs';
import { join } from 'path';
import {
  IPluginWrapper,
  IInitializedPluginWrapper,
  PluginInstance
} from './IPluginWrapper';
import { IClient } from '@/shared/interfaces/IClient';
import { createLogger } from '@/shared/utils/logger';
import Config from '../Config';

const logger = createLogger("pluginManager");

export class PluginManager {
  private client: IClient;
  private plugins: Map<string, IInitializedPluginWrapper> = new Map();

  constructor(client: IClient) {
    this.client = client;
  }

  private async requireModule(path: string): Promise<PluginInstance> {
    if (!existsSync(path)) {
      logger.error(`Plugin path ${path} does not exist`);
      return;
    }

    return await import(path);
  }

  public async registerPlugin(plugin: IPluginWrapper): Promise<void> {
    if (!plugin.name || !plugin.packageName) {
      logger.error(`Plugin name or package name is not defined`);
    }

    if (this.pluginExists(plugin.name)) {
      logger.error(`Plugin with name ${plugin.name} already exists`);
    }

    try {
      const pluginInstance = plugin.isRelative
        ? await this.requireModule(join(Config.pluginsPath, plugin.packageName))
        : await this.requireModule(
            join(process.cwd(), 'node_modules', plugin.packageName)
          );

      this.addPlugin(plugin, pluginInstance.default);
    } catch (error: any) {
      logger.error(
        `Plugin with name ${plugin.name} failed to load: ${error.message}`
      );
      throw error;
    }
  }

  private pluginExists(name: string): boolean {
    return this.plugins.has(name);
  }

  private addPlugin(
    plugin: IPluginWrapper,
    pluginInstance: PluginInstance
  ): void {
    this.plugins.set(plugin.name, { ...plugin, instance: pluginInstance });
  }

  public loadPlugin(name: string): any {
    if (!this.pluginExists(name)) {
      logger.error(`Plugin with name ${name} does not exist`);
    }

    const plugin = this.plugins.get(name) as IInitializedPluginWrapper;
    const pluginInstance = plugin.instance as PluginInstance;
    const protocol = {
      logger: createLogger(name),
      client: this.client,
      registerCommand: this.client.registerCommand,
      registerCronjob: this.client.registerCronjob
    };
    return new pluginInstance(protocol);
  }
}
