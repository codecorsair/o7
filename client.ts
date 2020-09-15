import {
  AkairoClient,
  CommandHandler,
  ListenerHandler
} from 'discord-akairo';
import config from './config.json';

export class o7Client extends AkairoClient {
  constructor() {
    super({
      ownerID: config.owners,
    },{
      disableMentions: 'everyone'
    });

    // I'm being lazy and not writing my own .d.ts just for this...
    (this as any).listenerHandler = new ListenerHandler(this, {
      directory: __dirname + '/listeners/',
    });

    (this as any).commandHandler = new CommandHandler(this, {
      directory: __dirname + '/commands/',
      prefix: config.prefix,
    });

    (this as any).commandHandler.useListenerHandler((this as any).listenerHandler);
    (this as any).listenerHandler.loadAll();
    (this as any).commandHandler.loadAll();

  }
}