import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { Command } from "../lib/types/Command";

export default {
  aliases: ["removerole"],
  data: (alias: string) => new SlashCommandBuilder()
    .setName(alias)
    .setDescription('Remove a role from a member.')
    .setDMPermission(false)
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to remove the role from.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to remove from the member.')
        .setRequired(true)),
  help: {
    description: 'This command will remove one or more roles from a member.',
    examples: [{
      args: '@member @role',
      description: 'Removes the @role from @member.',
    }, {
      args: '@member @role1 @role2 (...any number of roles)',
      description: 'Removes all the provided roles from @member.'
    }]
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const member = interaction.options.getMember('member');
    const roleName = interaction.options.get('role')?.name as string;

    if (!interaction.guild) {
      return interaction.editReply('This command can only be used in a server.');
    }
    const role = interaction.guild.roles.cache.find(role => role.name === roleName);

    if (!member || !role) {
      return interaction.editReply('You must provide a user and a role to remove.');
    }

    try {
      (member.roles as GuildMemberRoleManager).remove(role);
      return interaction.editReply(`Successfully removed ${role} from ${member}`);
    } catch (err) {
      console.error(err);
      return interaction.editReply(`Failed to remove ${role} from ${member}.`);
    }
  }
} as Command;
