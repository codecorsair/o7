import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import changelog from '../data/changelog.json';

export default class ChangelogCommand extends Command {
  constructor() {
    super('changelog', {
      aliases: ['changelog'],
      args: [
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
    changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => message.channel.send(new MessageEmbed(e as any)));
  }
}