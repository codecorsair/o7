import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MySkillsCommand extends Command {
  constructor() {
    super('myskills', {
      aliases: ['myskills'],
      ownerOnly: true,
    });
  }

  exec(message: Message) {
    return message.reply('Pong!');
  }
}