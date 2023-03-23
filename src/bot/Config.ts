import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  BOT_INTENTS,
  BOT_PLUGINS_PATH,
  BOT_TOKEN,
} = process.env;

export interface IConfig {
  intents: string[];
  pluginsPath: string;
  token: string;
}

const Config = new GenericConfig<IConfig>("bot.json");

export default {
  intents: assert<string[]>("Intents are not defined", Config.get("intents"), BOT_INTENTS),
  pluginsPath: assert<string>("Plugins path is not defined", Config.get("pluginsPath"), BOT_PLUGINS_PATH),
  token: assert<string>("Token is not defined", Config.get("token"), BOT_TOKEN),
} as IConfig;