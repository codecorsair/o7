import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { getClient, collections } from '../lib/db';

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
    });
  }

  *args(message: Message) {
    if (!message.guild) {
      return {
        help: true,
      };
    }

    const help = yield {
      type: 'flag',
      flag: 'help'
    }

    if (help) {
      return {
        help
      };
    }

    const appChannel = yield {
      type: 'channel',
      prompt: {
        start: 'What channel should I post completed applications to?'
      }
    }

    const questions = yield {
      match: 'none',
      prompt: {
        start: [
          'Please type your application questions now with each question in a single message.',
          'Type `stop` when you are done adding questions.'
        ],
        infinite: true,
      }
    }

    return {
      help,
      appChannel,
      questions
    };
  }

  async exec(message: Message, args: any) {
    if (!args || args.help || !message.guild) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
          .setTitle('Application Config Command Help')
          .setDescription('This command is used to configure application questions and the channel to which completed applications are posted.')
          .addField('Usage', `**${prefix}appconfig**

*aliases:* **${prefix}configapp**`));
    }

    const client = getClient();
    try {
      await client.connect();
      await client.getDb()
        .collection(collections.appconfig)
        .updateOne({ id: message.guild.id },
                   { $set: {
                      id: message.guild.id,
                      appChannel: args.appChannel.id,
                      questions: args.questions,
                    } },
                   { upsert: true });
      return message.reply('Application configuration complete!');
    } catch (err) {
      return message.reply('I\'m sorry, but there was a problem storing your config to our database.');
    }
  }
}
