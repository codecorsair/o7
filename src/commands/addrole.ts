import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class AddRoleCommand extends Command {
  constructor() {
    super('addrole', {
      aliases: ['addrole', 'setrole'],
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
        },
        {
          id: 'help',
          match: 'flag',
          flag: 'help'
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    if (!args || args.help || !args.member || !args.role) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
        .setTitle('Add Role Command Help')
        .setDescription('This command will add a role to a member.')
        .addField('Usage', `**${prefix}setrole** @member @role
**${prefix}setrole** @role @member

*aliases:* **${prefix}addrole**`));
    }

    args.member.roles.add(args.role)
      .then(() => message.reply('Done!'))
      .catch(console.error);
  }
}
