import { IPlugin } from "./shared/IPlugin";
import { IPluginSettings } from "./shared/IPluginSettings";

export interface IPluginWrapper {
  name: string;
  packageName: string;
  isRelative?: boolean;
  instance?: IPlugin;
  settings?: IPluginSettings;
}