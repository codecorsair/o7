import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a member.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to remove the role from.')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to remove from the member.')
        .setRequired(true)),
  async execute(interaction: CommandInteraction) {
    const member = interaction.options.getMember('member');
    const roleName = interaction.options.get('role')?.name as string;
    
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server.');
    }
    const role = interaction.guild.roles.cache.find(role => role.name === roleName);
    
    if (!member || !role) {
      return interaction.reply('You must provide a user and a role to remove.');
    }

    try {
      (member.roles as GuildMemberRoleManager).remove(role);
      interaction.reply(`Successfully removed ${role} from ${member}`);
    } catch (err) {
      console.error(err);
      interaction.reply(`Failed to remove ${role} from ${member}.`);
    }
  }
}
