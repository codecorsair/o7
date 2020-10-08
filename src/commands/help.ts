import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import help from '../data/help_embed.json';

export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'h'],
      args: [
        {
          id: 'here',
          match: 'flag',
          flag: 'here'
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    const destination = args && args.here ? message.channel : message.author;
    help.embeds.forEach(e => destination.send(new MessageEmbed(e)));
  }
}