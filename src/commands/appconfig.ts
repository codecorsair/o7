import { Message, CommandDef } from '../lib/types';
import { getClient, collections } from '../lib/db';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import { localize } from '../lib/localize';

export interface AppConfig {
  id: string,
  appChannel: string,
  questions: string[],
}

const command: CommandDef = {
  name: 'command_appconfig_name',
  alias: ['appconfig'],
  channel: 'guild',
  args: [{
    key: 'channel',
    name: 'command_appconfig_arg_channel',
    type: 'channel',
    prompt: {
      start: 'command_appconfig_arg_channel_prompt',
    },
  },{
    key: 'questions',
    name: 'command_appconfig_arg_questions',
    type: 'content',
    prompt: {
      start: 'command_appconfig_arg_questions_prompt',
      infinite: true,
    }
  }],
  help: {
    description: 'command_appconfig_help_description',
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
      return message.reply(localize('command_appconfig_response_complete', message.prefix, message.lang));
    } catch (err) {
      console.error(err);
      return message.reply(localize('command_appconfig_response_error', message.prefix, message.lang));
    } finally {
      await client.close();
    }
  }
};

export default command;
