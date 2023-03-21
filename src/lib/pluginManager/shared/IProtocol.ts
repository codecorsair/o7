import { ICommand } from "./ICommand";
import { ILogger } from "./ILogger";

export interface IProtocol {
  logger: ILogger;
  registerCommand: (command: ICommand) => void;
}
