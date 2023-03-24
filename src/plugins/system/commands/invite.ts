import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ICommand } from '@/shared/interfaces/ICommand';

export default {
  aliases: ['invite'],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription('Get the invite link for the bot'),
  description: 'Get the invite link for the bot',
  help: {
    title: 'Invite',
    description: 'Get the invite link for the bot'
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Invite')
          .setDescription('Invite the bot to your server!')
          .addFields([
            {
              name: 'Invite',
              value:
                'https://discord.com/api/oauth2/authorize?client_id=1087483792463237210&permissions=70867078144&scope=bot'
            },
            {
              name: 'Support this Bot',
              value: 'https://top.gg/bot/1087483792463237210'
            }
          ])
      ]
    });
  }
} as ICommand;
