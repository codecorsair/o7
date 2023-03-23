import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  BOT_INTENTS,
  BOT_PLUGINS_PATH,
  BOT_TOKEN,
  BOT_PLUGINS,
} = process.env;

export interface IConfig {
  intents: string[];
  pluginsPath: string;
  token: string;
  plugins: string[];
}

const Config = new GenericConfig<IConfig>("bot.json");

export default {
  intents: assert<string[]>("Intents are not defined", BOT_INTENTS, Config.get("intents")),
  pluginsPath: assert<string>("Plugins path is not defined", BOT_PLUGINS_PATH, Config.get("pluginsPath"), resolve("./plugins")),
  token: assert<string>("Token is not defined", BOT_TOKEN, Config.get("token")),
  plugins: assert<string[]>("Plugins are not defined", BOT_PLUGINS?.split(","), Config.get("plugins"), ["system"]),
} as IConfig;