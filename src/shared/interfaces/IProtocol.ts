import { ICommand } from './ICommand';
import { ILogger } from './ILogger';
import { ICronjob } from './ICronjob';
import { IClient } from './IClient';

export interface IProtocol {
  logger: ILogger;
  client: IClient;
  registerCommand: (command: ICommand) => void;
  registerCronjob: (cronjob: ICronjob) => void;
}
