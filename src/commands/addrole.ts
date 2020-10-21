import { Role, GuildMember } from 'discord.js';
import { Message, CommandDef, DiscordPermissions } from '../lib/types';

const command: CommandDef = {
  name: 'command_addrole_name',
  alias: ['addrole', 'setrole'],
  args: [{
    key: 'member',
    name: 'command_addrole_arg_member',
    type: 'member'
  },{
    key: 'member',
    name: 'command_addrole_arg_role',
    type: 'role',
  }],
  help: {
    description: 'command_addrole_help_description',
    examples: [{
      args: 'command_addrole_help_example_one_args',
      description: 'command_addrole_help_example_one_description',
    },{
      args: 'command_addrole_help_example_two_args',
      description: 'command_addrole_help_example_two_description'
    }]
  },
  handler: async (message: Message, args: { member: GuildMember; role: Role; }) => {
    message.mentions.roles.forEach(async role => {
      try {
        await args.member.roles.add(role);
        message.channel.send(`Successfully added ${role} to ${args.member}`);
      } catch (err) {
        console.error(err);
        message.channel.send(`Failed to add ${role} to ${args.member}.`);
      }
    })
  },
  clientPermissions: [
    DiscordPermissions.MANAGE_ROLES,
  ],
  userPermissions: [
    DiscordPermissions.MANAGE_ROLES,
  ],
}

export default command;
