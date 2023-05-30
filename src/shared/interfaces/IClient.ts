import { Collection } from 'discord.js';
import { ICommand } from './ICommand';
import { ICronjob } from './ICronjob';
import { Client as DJSClient } from 'discord.js';

export interface IClient extends DJSClient {
  cluster: any;
  machine: any;
  rest: any;

  cronjobs: Collection<string, ICronjob>;
  commands: Collection<string, ICommand>;

  registerCommand: (command: ICommand) => void;
  registerCronjob: (cronjob: ICronjob) => void;
}
