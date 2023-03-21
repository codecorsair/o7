import {
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";

export interface ICommand {
  name: string;
  aliases?: string[];
  description: string;
  onInit: (commandName: string) => SlashCommandBuilder;
  onCommandInteraction: (interaction: CommandInteraction) => Promise<void>;
  onCommandAutocomplete: (
    interaction: AutocompleteInteraction
  ) => Promise<void>;
}
