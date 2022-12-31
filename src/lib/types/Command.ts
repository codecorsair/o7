import { AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';
export interface Command {
  aliases: string[];
  data: (alias: string) => SlashCommandBuilder;
  help?: {
    description: string;
    color?: string;
    examples?: {
      args: string;
      description?: string;
    }[];
  };
  owner?: boolean;
  disabled?: boolean;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
  execute: (interaction: CommandInteraction) => Promise<any>;
}
