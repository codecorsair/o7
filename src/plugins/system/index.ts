import { IPlugin } from "../../shared/interfaces/IPlugin";

import COMMAND_APPCONFIG from "./commands/appconfig";
//import COMMAND_CHANGELOG from "./commands/changelog";
import COMMAND_HELP from "./commands/help";
import COMMAND_INVITE from "./commands/invite";
//import COMMAND_STATUS from "./commands/status";

export default class extends IPlugin {
  private registerCommands(): void {
    this.protocol.registerCommand(COMMAND_APPCONFIG);
    // this.protocol.registerCommand(COMMAND_CHANGELOG);
    this.protocol.registerCommand(COMMAND_HELP);
    this.protocol.registerCommand(COMMAND_INVITE);
    //this.protocol.registerCommand(COMMAND_STATUS);
  }

  onInit(): void {
    this.registerCommands();
  }
  onDispose(): void {
  
  }
}