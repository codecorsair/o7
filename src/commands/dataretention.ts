import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import dr from '../data/dataretention.json';

export default class DataRetentionCommand extends Command {
  constructor() {
    super('dataretention', {
      aliases: ['dataretention'],
    });
  }

  exec(message: Message) {
    dr.embeds.forEach(e => message.author.send(new MessageEmbed(e)));
  }
}