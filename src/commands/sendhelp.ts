import { Command, Argument } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import help from '../data/help_embed.json';



export default class SendHelpCommand extends Command {
  constructor() {
    super('sendhelp', {
      aliases: ['sendhelp'],
      channel: 'guild',
      ownerOnly: true,
      args: [
        {
          id: 'destination',
          type: Argument.union('user', 'channel'),
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    if (!args || !args.destination) {
      help.embeds.forEach(e => message.channel.send(new MessageEmbed(e)));
      return;
    }
    help.embeds.forEach(e => args.destination.send(new MessageEmbed(e)));
  }
}