import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AutocompleteInteraction,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { ICommand } from "@/src/shared/interfaces/ICommand";
import { IClient } from "@/src/shared/interfaces/IClient";

const getAllCommands = (client: IClient) =>
  client.commands
    .map((command) => command.aliases.map((alias) => alias))
    .flat();

export default {
  aliases: ["help"],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription("Show help about commands")
      .addStringOption((option) =>
        option
          .setName("search")
          .setDescription("The command to get help for")
          .setRequired(true)
          .setAutocomplete(true)
      ),
  description: "Show help about commands",
  async commandAutocomplete(interaction: AutocompleteInteraction) {
    const search = interaction.options.getString("search") as string;
    const client = interaction.client as IClient;
    const commands = getAllCommands(client)
      .map((c) => ({
        name: c,
        value: c,
      }))
      .filter((c) => c.name.indexOf(search) !== -1);

    return interaction.respond(
      commands.length > 25 ? commands.slice(0, 25) : commands
    );
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const search = interaction.options.get("search")?.value as string;

    const client = interaction.client as IClient;
    const command = getAllCommands(client)
      .map((c) => ({
        name: c,
        value: c,
      }))
      .find((c) => c.name === search);

    if (!command) {
      await interaction.editReply(`No command found for ${search}`);
      return;
    }

    const help = client.commands.get(command.name)?.help;
    const aliases = client.commands.get(command.name)?.aliases;

    if (!help) {
      await interaction.editReply(`No help found for ${search}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Help for ${search}`)
      .setDescription(help.description);

    if (aliases && aliases.length > 1) {
      const embedAliases = aliases
        .filter((alias) => alias !== search)
        .map((alias) => ({
          name: alias,
          value: "No description",
          inline: false,
        }));

      embed.addFields(...embedAliases);
    }

    if (help.examples) {
      const embedExamples = help.examples.map((example) => ({
        name: example?.args ? `'${example.args.join(', ')}'` : "No arguments",
        value: example?.description ? example.description : "No description",
        inline: false,
      }));

      embed.addFields(...embedExamples);
    }

    await interaction.editReply({ embeds: [embed] });
    return;
  },
} as ICommand;
