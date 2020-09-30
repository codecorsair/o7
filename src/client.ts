import {
  AkairoClient,
  CommandHandler,
  ListenerHandler
} from 'discord-akairo';
import { Message } from 'discord.js';
import config from './config.json';
import * as settings from './lib/settings';

export class o7Client extends AkairoClient {

  constructor() {
    super({
      ownerID: config.owners,
      disableMentions: 'everyone'
    });

    // I'm being lazy and not writing my own .d.ts just for this...
    (this as any).listenerHandler = new ListenerHandler(this, {
      directory: __dirname + '/listeners/',
    });

    (this as any).commandHandler = new CommandHandler(this, {
      directory: __dirname + '/commands/',
      prefix: (message: Message) => {
        if (message.guild) {
          const prefix = settings.getSettings(message.guild.id).prefix;
          (message as any).prefix = prefix;
          return prefix;
        }
        (message as any).prefix = config.prefix;
        return config.prefix;
      },
    });

    (this as any).commandHandler.useListenerHandler((this as any).listenerHandler);

    (this as any).commandHandler.resolver.addType('attachmentOrLink', (message: Message, phrase: any) => {
      if (phrase) {
        return phrase;
      }
      if (message.attachments) {
        return message.attachments.first()?.url;
      }
      return null;
    });

    (this as any).listenerHandler.loadAll();
    (this as any).commandHandler.loadAll();

  }
}