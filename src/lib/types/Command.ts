import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
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
  execute: (interaction: CommandInteraction) => Promise<any>;
}
