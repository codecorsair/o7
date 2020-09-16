import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { db } from '../db';

export const APP_CONFIG_COLLECTION = 'appconfig';

export interface AppConfig {
  id: string,
  appChannel: string,
  questions: string[],
}

export default class AppConfigCommand extends Command {
  constructor() {
    super('appconfig', {
      aliases: ['appconfig', 'configapp'],
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'appChannel',
          type: 'channel',
          prompt: {
            start: 'What channel should I post completed applications to?'
          }
        },
        {
          id: 'questions',
          match: 'none',
          prompt: {
            start: [
              'Please type your application questions now with each question in a single message.',
              'Type `stop` when you are done adding questions.'
            ],
            infinite: true,
          }
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!message.guild) return;
    
    const doc = {
      id: message.guild.id,
      appChannel: args.appChannel.id,
      questions: args.questions,
    };
    
    try {
      db.collection(APP_CONFIG_COLLECTION)
        .upsert({ id: doc.id }, { $set: { ...doc } });
      return message.reply('Applications all set, Thanks!');
    } catch (err) {
      return message.reply('I\'m sorry, but there was a problem storing your config to our database.');
    }
  }
}