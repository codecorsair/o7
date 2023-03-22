import { IPlugin } from "../../shared/interfaces/IPlugin";

import COMMAND_SAFEJUMPS from "./commands/safejumps";
import COMMAND_REPROCESS from "./commands/reprocess";
import COMMAND_PRICECHECK from "./commands/pricecheck";
import COMMAND_PLANETARYRESOURCES from "./commands/planetaryresources";
//import COMMAND_LEXICON from "./commands/lexicon";
import COMMAND_JUMPS from "./commands/jumps";
import COMMAND_ITEM from "./commands/item";
import COMMAND_CONSTELLATIONRESOURCES from "./commands/constellationresources";
import COMMAND_BLUEPRINT from "./commands/blueprint";

export default class extends IPlugin {

  private registerCommands(): void {
    this.protocol.registerCommand(COMMAND_SAFEJUMPS);
    this.protocol.registerCommand(COMMAND_REPROCESS);
    this.protocol.registerCommand(COMMAND_PRICECHECK);
    this.protocol.registerCommand(COMMAND_PLANETARYRESOURCES);
    //this.protocol.registerCommand(COMMAND_LEXICON);
    this.protocol.registerCommand(COMMAND_JUMPS);
    this.protocol.registerCommand(COMMAND_ITEM);
    this.protocol.registerCommand(COMMAND_CONSTELLATIONRESOURCES);
    this.protocol.registerCommand(COMMAND_BLUEPRINT);
  }

  onInit(): void {
    this.registerCommands();
  }
  onDispose(): void {
      
  }
}