import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import help from '../data/help_embed.json';



export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'h'],
      channel: 'guild',
    });
  }

  exec(message: Message) {
    return message.reply(new MessageEmbed(help));
  }
}