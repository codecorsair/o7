import { IPlugin } from "../../shared/interfaces/IPlugin";

export interface IPluginWrapper {
  name: string;
  packageName: string;
  isRelative?: boolean;
}

export type PluginInstance = any extends IPlugin ? any : never

export interface IInitializedPluginWrapper extends IPluginWrapper {
  instance: PluginInstance;
}