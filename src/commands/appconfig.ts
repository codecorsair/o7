import { Command } from "../lib/types/Command";
import { getClient, collections } from "../lib/db";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface AppConfig {
  id: string;
  appChannel: string;
  questions: string[];
}

export default {
  aliases: ["appconfig"],
  data: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription("Help: /help appconfig")
      .setDMPermission(false)
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to send the application to.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("questions")
          .setDescription("The questions to ask in the application.")
          .setRequired(true)
      ),
  help: {
    description: "This command will configure the application.",
    examples: [
      {
        args: "#channel question1, question2, question3",
        description:
          "Configures the application to send to #channel and ask the questions.",
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.get("channel")?.channel?.id;
    const questions = interaction.options.get("questions")?.value as string;

    if (!channel || !questions) {
      return interaction.editReply("You must provide a channel and questions.");
    }

    try {
      const config: AppConfig = {
        id: String(interaction.guildId),
        appChannel: channel,
        questions: questions.split(","),
      };

      const client = getClient();
      await client.connect();
      await client
        .getDb()
        .collection(collections.appconfig)
        .updateOne(
          { id: interaction.guildId },
          { $set: config },
          { upsert: true }
        );

      await interaction.editReply(`Successfully configured the application.`);
    } catch (err) {
      console.error(err);
      return interaction.editReply(`Failed to configure the application.`);
    }
  },
} as Command;
