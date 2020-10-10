import { 
  Client as DJSClient,
  ClientOptions,
  Collection,
} from 'discord.js';
import { Command } from './Command';
import { loadCommands } from '../utils/commands';

export class Client extends DJSClient {

  public commands: Collection<string, Command> = new Collection();
  public owners: string[] = [];

  constructor(options?: ClientOptions) {
    super(options);
  }

  public loadCommands = (directory: string) => loadCommands(directory, this);
}
