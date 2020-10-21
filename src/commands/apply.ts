import { MessageEmbed } from 'discord.js';
import { Message, CommandDef, Arg } from '../lib/types';
import { sleep } from '../lib/sleep';
import * as mongo from '../lib/db';
import { AppConfig } from './appconfig';
import { askQuestionWithMessageResponse } from '../lib/utils/args';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_apply_name',
  alias: ['apply'],
  channel: 'guild',
  help: {
    description: 'command_apply_help_description',
  },
  args: async (message: Message) => {
    if (!message || !message.guild) return;

    let config: AppConfig | null = null;
    const client = mongo.getClient();
    try {
      await client.connect();
      config = await client.getDb()
        .collection(mongo.collections.appconfig)
        .findOne<AppConfig>({ id: message.guild.id });
    } catch (err) {
      console.error(err);
      message.channel.send(localize('command_apply_response_error', message.prefix, message.lang));
      return;
    } finally {
      await client.close();
    }

    if (!config) return;

    const responses: any = [];
    for (const question of config.questions) {
      const answer = await askQuestionWithMessageResponse(question, message.channel, { key: 'answer', type: 'content' } as Arg);
      
      responses.push({
        question: question,
        answer,
      });
      await sleep(500);
    }

    return {
      responses
    }
  },
  handler: async (message: Message, args: { responses: { question: string; answer: string; }[]; }) => {
    if (!message.guild || !args) return;
    
    const client = mongo.getClient();
    let config: AppConfig | null = null;
    try {
      await client.connect();
      config = await client.getDb()
        .collection(mongo.collections.appconfig)
        .findOne<AppConfig>({ id: message.guild.id });
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
    
    if (!config) {
      return;
    }
    
    message.client.channels
      .fetch(config.appChannel)
      .then((channel: any) => channel.send(new MessageEmbed()
        .setColor("#FF0000")
        .setTitle(`New Application for ${message.author.username}`)
        .addFields(args.responses.map((a: { question: string; answer: string}) => ({ name: a.question, value: a.answer })))
        .addField('ID', message.author)
        .addField('Channel', message.channel)
      ));
    
      return message.reply(localize('command_apply_response_success', message.prefix, message.lang));
  }
};

export default command;
