import { ICommand } from './ICommand';
import { ILogger } from './ILogger';
import { ICronjob } from './ICronjob';
import { IClient } from './IClient';
import { IMiddleware } from './IMiddleware';

export interface IProtocol {
  logger: ILogger;
  client: IClient;
  registerMiddleware: (middleware: IMiddleware) => void;
  registerCommand: (command: ICommand) => void;
  registerCronjob: (cronjob: ICronjob) => void;
}
