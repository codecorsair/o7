import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, PermissionsFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role to a member.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to add the role to.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('roles')
        .setDescription('The role to add to the member.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsFlagsBits.MANAGE_ROLES),
  async execute(interaction: CommandInteraction) {
    const member = interaction.options.getMember('member');
    const roles = interaction.options.get('roles');

    roles.forEach(async role => {
      try {
        await member.roles.add(role);
        interaction.reply(`Successfully added ${role} to ${member}`);
      } catch (err) {
        console.error(err);
        interaction.reply(`Failed to add ${role} to ${member}.`);
      }
    })
  }
}