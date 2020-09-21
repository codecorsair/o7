import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
// import { getClient, collections } from '../lib/db';

export default class SetMySkillsCommand extends Command {
  constructor() {
    super('setmyskills', {
      aliases: ['setmyskills'],
      args: [
        {
          id: ''
        }
      ]
    });
  }

  exec(message: Message) {
    return message.reply('Pong!');
  }
}