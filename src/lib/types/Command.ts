import { AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js';
export interface Command {
  data: SlashCommandBuilder;
  help?: {
    description: string;
    color?: string;
    examples?: {
      args: string;
      description?: string;
    }[];
  };
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
  execute: (interaction: CommandInteraction) => Promise<any>;
}
