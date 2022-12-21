import { Role, GuildMember } from 'discord.js';
import { Message, CommandDef, DiscordPermissions } from '../lib/types';

const command: CommandDef = {
  name: 'add role',
  alias: ['addrole', 'setrole'],
  args: [{
    name: 'member',
    type: 'member'
  },{
    name: 'role',
    type: 'role',
  }],
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
