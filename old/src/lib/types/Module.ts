import { EmbedBuilder } from '@discordjs/builders';
import { Client, Message, CMProvider } from './';

/**
 * ModuleDef defines a module.
 * 
 * Adding a module should be done within a directory under src/modules/ and the ModuleDef
 * object must be the default export of an index.js/ts file in that directory.
 * 
 * The Module directory structure should mirror the root src/ directory and and may even
 * contain sub modules.
 * 
 * ie:
 * src/
 *  - commands/
 *  - modules/
 *   - custom_module/
 *    - index.ts
 *    - commands/
 *    - modules/
 *     - custom_module_submodule/
 *      - ... and so on
 *  */ 
export interface ModuleDef {
  // Name of the module, used as the key for the Client module collection.
  name: string;
  // initialize is called when the module is loaded
  initialize: (client: Client) => any;
  // getHelp is called when generating global help messages
  getHelp: (message: Message) => EmbedBuilder[] | Promise<EmbedBuilder[]>;
  // required to delete any guild data stored by this module
  deleteGuildData: (guildId: string) => Promise<boolean>;
  // required to delete any user data stored by this module
  deleteUserData: (guildId: string) => Promise<boolean>;

  // If set, this module will accept commands under the given command name.
  // ie: when commandGroup = 'voice'
  //  user command: `!voice rename some text`
  //  <!voice> => identifies the module with the command group: 'voice'
  //  <rename> => identifies the 'rename' command on the module
  //  <some text> => the args sent to the command.
  commandGroup?: string[];

  // If true, no comamnds will be processed from this module
  disabled?: boolean;

  help?: {
    description: string;
  }
}

type defAndProvider = ModuleDef & CMProvider;
export interface Module extends defAndProvider {
  type: 'module';
}
