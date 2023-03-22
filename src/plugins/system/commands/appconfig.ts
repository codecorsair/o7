import { ICommand } from "../../../shared/interfaces/ICommand";
import { getClient, collections } from "../libs/db";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface AppConfig {
  id: string;
  appChannel: string;
  questions: string[];
}

export default {
  aliases: ["appconfig"],
  commandBuilder: (alias: string) =>
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
  description: "Help: /help appconfig",
  help: {
    title: "App Config",
    description: "This command will configure the application.",
    examples: [
      {
        args: "#channel question1, question2, question3",
        description:
          "Configures the application to send to #channel and ask the questions.",
      },
    ],
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.get("channel")?.channel?.id;
    const questions = interaction.options.get("questions")?.value as string;

    if (!channel || !questions) {
      await interaction.editReply("You must provide a channel and questions.");
      return;
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
      return;
    } catch (err) {
      console.error(err);
      await interaction.editReply(`Failed to configure the application.`);
      return;
    }
  },
} as ICommand;
