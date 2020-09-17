import {
  AkairoClient,
  CommandHandler,
  ListenerHandler
} from 'discord-akairo';
import { Message } from 'discord.js';
import config from './config.json';
import * as settings from './lib/guild-settings';

export class o7Client extends AkairoClient {

  public settings = settings;

  constructor() {
    super({
      ownerID: config.owners,
      disableMentions: 'everyone'
    });

    this.settings = settings;
    this.settings.initSettings();

    // I'm being lazy and not writing my own .d.ts just for this...
    (this as any).listenerHandler = new ListenerHandler(this, {
      directory: __dirname + '/listeners/',
    });

    (this as any).commandHandler = new CommandHandler(this, {
      directory: __dirname + '/commands/',
      prefix: (message: Message) => {
        if (message.guild) {
          return this.settings.getSettings(message.guild.id).prefix;
        }
        return '!'
      },
    });

    (this as any).commandHandler.useListenerHandler((this as any).listenerHandler);
    (this as any).listenerHandler.loadAll();
    (this as any).commandHandler.loadAll();

  }
}