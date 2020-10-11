import { 
  Client as DJSClient,
  ClientOptions,
  Collection,
} from 'discord.js';
import { Command, Module } from './';
import { loadCommands } from '../utils/commands';
import { loadModules } from '../utils/modules';

export class Client extends DJSClient {

  public commands: Collection<string, Command | Module> = new Collection();
  public modules: Collection<string, Module> = new Collection();
  public owners: string[] = [];

  constructor(options?: ClientOptions) {
    super(options);
  }

  public loadCommands = (directory: string) => loadCommands(directory, this);
  public loadModules = (directory: string) => loadModules(directory, this, this);
}
