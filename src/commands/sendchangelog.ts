import { Command, Argument } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import changelog from '../data/changelog.json';



export default class SendHelpCommand extends Command {
  constructor() {
    super('sendchangelog', {
      aliases: ['sendchangelog'],
      channel: 'guild',
      ownerOnly: true,
      args: [
        {
          id: 'destination',
          type: Argument.union('user', 'channel'),
        },
        {
          id: 'count',
          type: 'number',
          default: 1,
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    if (args.count < 1) args.count = 1;

    if (!args.destination) {
      changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => message.channel.send(new MessageEmbed(e as any)));
      return;
    }
    changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => args.destination.send(new MessageEmbed(e as any)));
  }
}