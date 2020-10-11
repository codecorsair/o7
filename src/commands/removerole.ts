import { Role, GuildMember } from 'discord.js';
import { Message, CommandDef, DiscordPermissions } from '../lib/types';

const command: CommandDef = {
  name: 'remove role',
  alias: ['removerole', 'droprole'],
  args: [{
    name: 'member',
    type: 'member'
  },{
    name: 'role',
    type: 'role',
  }],
  help: {
    description: 'This command will remove one or more roles from a member.',
    examples: [{
      args: '@member @role',
      description: 'Removes the @role from @member.',
    },{
      args: '@member @role1 @role2 (...any number of roles)',
      description: 'Removes all the provided roles from @member.'
    }]
  },
  handler: async (message: Message, args: { member: GuildMember; role: Role; }) => {
    message.mentions.roles.forEach(async role => {
      try {
        await args.member.roles.remove(role);
        message.channel.send(`Successfully removed ${role} from ${args.member}`);
      } catch (err) {
        console.error(err);
        message.channel.send(`Failed to remove ${role} from ${args.member}.`);
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
