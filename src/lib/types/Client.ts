import { 
  Client as DJSClient,
  ClientOptions,
  Collection,
GatewayIntentBits,
} from 'discord.js';
import { Command/*, Module*/ } from './';
import { loadCommands } from '../utils/commands';
// import { loadModules } from '../utils/modules.ts';

export class Client extends DJSClient {

  public commands: Collection<string, Command /*| Module*/> = new Collection();
  // public modules: Collection<string, Module> = new Collection();
  public owners: string[] = [];

  constructor(options?: ClientOptions) {
    super(options || {
      intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildMembers,
        // GatewayIntentBits.GuildBans,
        // GatewayIntentBits.GuildEmojisAndStickers,
        // GatewayIntentBits.GuildIntegrations,
        // GatewayIntentBits.GuildWebhooks,
        // GatewayIntentBits.GuildInvites,
        // GatewayIntentBits.GuildVoiceStates,
        // GatewayIntentBits.GuildPresences,
        // GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.GuildMessageReactions,
        // GatewayIntentBits.GuildMessageTyping,
        // GatewayIntentBits.DirectMessages,
        // GatewayIntentBits.DirectMessageReactions,
        // GatewayIntentBits.DirectMessageTyping,
        // GatewayIntentBits.MessageContent,
        // GatewayIntentBits.GuildScheduledEvents,
        // GatewayIntentBits.AutoModerationConfiguration,
        // GatewayIntentBits.AutoModerationExecution
      ]
    });
  }

  public loadCommands = (directory: string) => loadCommands(directory, this);
  // public loadModules = (directory: string) => loadModules(directory, this, this);
}
