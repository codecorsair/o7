import { Message, CommandDef } from '../lib/types';
import { getClient, collections } from '../lib/db';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';

export interface AppConfig {
  id: string,
  appChannel: string,
  questions: string[],
}

const command: CommandDef = {
  name: 'appconfig',
  alias: ['appconfig'],
  channel: 'guild',
  args: [{
    name: 'channel',
    type: 'channel',
    prompt: {
      start: `What channel should I post completed applications to?`,
    },
  },{
    name: 'questions',
    type: 'content',
    prompt: {
      start: 'Please type your application questions now with each question in a single message.\nType `stop` when you are done adding questions.',
      infinite: true,
    }
  }],
  help: {
    description: 'This command is used to configure application questions and the channel to which completed applications are posted.',
  },
  handler: async (message: Message, args: { channel: TextChannel | NewsChannel; questions: string[]; }) => {
    if (!message.guild) return;
    const client = getClient();
    try {
      await client.connect();
      await client.getDb()
        .collection(collections.appconfig)
        .updateOne({ id: message.guild.id },
                   { $set: {
                      id: message.guild.id,
                      appChannel: args.channel.id,
                      questions: args.questions,
                    } },
                   { upsert: true });
      return message.reply('Application configuration complete!');
    } catch (err) {
      return message.reply('I\'m sorry, but there was a problem storing your config to our database.');
    } finally {
      await client.close();
    }
  }
};

export default command;
