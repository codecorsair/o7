import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import verify from '../data/verification.json';

export default class VerifyCommand extends Command {
  constructor() {
    super('verify', {
      aliases: ['verify'],
      channel: 'guild',
      ownerOnly: true,
    });
  }

  async exec(message: Message) {
    verify.embeds.forEach(e => message.channel.send(new MessageEmbed(e)));
  }
}