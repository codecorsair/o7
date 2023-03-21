import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';
import { Command } from '../lib/types/Command';

export default {
  aliases: ['addrole', 'addroles'],
  data: (alias: string) => new SlashCommandBuilder()
    .setName(alias)
    .setDescription('Help: /help addrole')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to add the role to.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to add to the member.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  help: {
    description: 'This command will add on or more roles to a member.',
    examples: [{
      args: '@member @role',
      description: 'Adds the @role to @member.',
    },{
      args: '@member @role1 @role2 (...any number of roles)',
      description: 'Adds all the provided roles to @member.'
    }]
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getMember('member');
    const roleName = interaction.options.get('role')?.name as string;
    if (!interaction.guild) {
      return interaction.editReply('This command can only be used in a server.');
    }
    const role = interaction.guild.roles.cache.find(role => role.name === roleName);

    if (!member || !role) {
      return interaction.editReply('You must provide a member and a role.');
    }

    try {
      // TODO: Find out how to add a role to a member.
      (member.roles as GuildMemberRoleManager).add(role);
      return interaction.editReply(`Successfully added ${role} to ${member}`);
    } catch (err) {
      console.error(err);
      return interaction.editReply(`Failed to add ${role} to ${member}.`);
    }
  }
} as Command;