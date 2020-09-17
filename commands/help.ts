import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import help from '../data/help_embed.json';



export default class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'h'],
    });
  }

  exec(message: Message) {
    return message.author.send(help.embeds.map(h => new MessageEmbed(h)));
  }
}