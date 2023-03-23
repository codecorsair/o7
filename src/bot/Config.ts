import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const { BOT_INTENTS, BOT_PLUGINS_PATH, BOT_TOKEN, BOT_PLUGINS } = process.env;

export interface IConfig {
  intents: string[];
  pluginsPath: string;
  token: string;
  plugins: string[];
}

const Config = new GenericConfig<IConfig>('bot.json');

export default {
  intents: assert<string[]>(
    `Configure bot intents using the "intents" key in the config file or the "BOT_INTENTS" environment variable.`,
    BOT_INTENTS,
    Config.get('intents')
  ),
  pluginsPath: assert<string>(
    `Configure bot plugins path using the "pluginsPath" key in the config file or the "BOT_PLUGINS_PATH" environment variable.`,
    BOT_PLUGINS_PATH,
    Config.get('pluginsPath'),
    resolve('./plugins')
  ),
  token: assert<string>(
    `Configure bot token using the "token" key in the config file or the "BOT_TOKEN" environment variable.`,
    BOT_TOKEN,
    Config.get('token')
  ),
  plugins: assert<string[]>(
    `Configure bot plugins using the "plugins" key in the config file or the "BOT_PLUGINS" environment variable.`,
    BOT_PLUGINS?.split(','),
    Config.get('plugins'),
    ['system']
  )
} as IConfig;
