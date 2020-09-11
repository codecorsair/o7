import {
  AkairoClient,
  CommandHandler,
  ListenerHandler
} from 'discord-akairo';
import config from './config.json';

export class o7Client extends AkairoClient {
  constructor() {
    super({
      ownerID: '106614950662791168'
    },{
      disableMentions: 'everyone'
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: __dirname + '/listeners/',
    });

    this.commandHandler = new CommandHandler(this, {
      directory: __dirname + '/commands/',
      prefix: config.PREFIX,
    });

    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();

  }
}