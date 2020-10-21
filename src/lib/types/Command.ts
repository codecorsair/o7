import { Message as DJSMessage } from 'discord.js';
import { LocalizeKey } from '../localize';
import { Message, DiscordPermissions } from './';

export interface Arg {
  key: string;
  name: LocalizeKey;
  type?: 'content' | 'phrase' | 'channel' | 'member' | 'role' | 'flag' | 'number' | 'restContent';
  optional?: boolean;
  default?: any;
  flag?: string;
  prompt?: {
    start: LocalizeKey | ((message: DJSMessage) => any);
    timeout?: number;
    infinite?: boolean;
    stop?: string;
    choices?: string[]
    reactions?:{
      emoji: string | {
        name: string;
        id: string;
        animated?: boolean;
      };
      value: any;
    }[],
  },
}

export interface CommandDef {
  // Name of the command.
  name: LocalizeKey;

  // Command name & aliases used to execute this command 
  alias: string[];

  handler: (message: Message, args: any) => any;

  args?: Arg[] | ((message: Message, command: CommandDef) => any);

  help?: {
    description: LocalizeKey;
    color?: string;
    examples?: {
      args: LocalizeKey;
      description?: LocalizeKey;
    }[];
  };

  clientPermissions?: DiscordPermissions[];
  userPermissions?: DiscordPermissions[] | ((message: Message) => boolean);

  /**
   * Disables this command entirely.
   */
  disabled?: boolean;

  /**
   * Disables help for this command.
   */
  disableHelp?: boolean;

  /**
   * Restricts this command to only be executed by a bot owner.
   */
  owner?: boolean;

  /**
   * If set, this command will only execution in this channel type.
   */
  channel?: 'guild' | 'dm';
}

export interface Command extends CommandDef {
  type: 'command';
}
