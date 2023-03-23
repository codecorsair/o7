import { CommandInteraction, AutocompleteInteraction } from 'discord.js';

export interface ICommand {
  disabled?: boolean;
  aliases: string[];
  description: string;
  help?: {
    title: string;
    description: string;
    examples?: {
      args: string[];
      description: string;
    }[];
  };
  commandBuilder: (commandName: string) => any;
  commandInteraction: (interaction: CommandInteraction) => Promise<void>;
  commandAutocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
