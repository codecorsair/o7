import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role to a member.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to add the role to.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to add to the member.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction: CommandInteraction) {
    const member = interaction.options.getMember('member');
    const roleName = interaction.options.get('role')?.value as string;
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server.');
    }
    const role = interaction.guild.roles.cache.find(role => role.name === roleName);

    if (!member || !role) {
      return interaction.reply('You must provide a member and a role.');
    }

    try {
      // TODO: Find out how to add a role to a member.
      (member.roles as GuildMemberRoleManager).add(role);
      interaction.reply(`Successfully added ${role} to ${member}`);
    } catch (err) {
      console.error(err);
      interaction.reply(`Failed to add ${role} to ${member}.`);
    }
  }
}