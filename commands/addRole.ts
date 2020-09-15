import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class AddRoleCommand extends Command {
  constructor() {
    super('addrole', {
      aliases: ['addrole'],
      userPermissions: ['ADMINISTRATOR'],
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member',
          unordered: true,
        },
        {
          id: 'role',
          type: 'role',
          unordered: true,
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    args.member.roles.add(args.role)
      .then(() => message.reply('Done!'))
      .catch(console.error);
  }
}
