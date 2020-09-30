import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';
import { sleep } from '../lib/sleep';
import * as mongo from '../lib/db';
import { AppConfig } from './appconfig';

export default class ApplicationCommand extends Command {
  constructor() {
    super('apply', {
      aliases: ['apply', 'app', 'application'],
      channel: 'guild',
    });
  }

  notConfigured = (message: Message) => {
    message.reply('The administrators of this discord have not yet configured applications. Please use the `appConfig` command to do so.');
  }

  async *args(message: Message) {
    if (!message || !message.guild) return { help: true };

    const help = yield {
      type: 'flag',
      flag: 'help'
    }

    if (help) {
      return {
        help
      };
    }

    let config: AppConfig | null = null;
    const client = mongo.getClient();
    try {
      await client.connect();
      config = await client.getDb()
        .collection(mongo.collections.appconfig)
        .findOne<AppConfig>({ id: message.guild.id });
    } catch (err) {
      console.error(err);
    }

    if (!config) {
      this.notConfigured(message);
      return null;
    }

    const answers: any = [];
    for (const question of config.questions) {
      const answer = yield {
        type: 'content',
        prompt: {
          start: question,
        }
      };
      answers.push({
        question: question,
        answer,
      });
      await sleep(500);
    }

    return {
      answers
    }
  }

  async exec(message: Message, args: any) {
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
    }
    
    if (!config) {
      this.notConfigured(message);
      return;
    }
    
    this.client.channels
      .fetch(config.appChannel)
      .then((channel: any) => channel.send(new MessageEmbed()
        .setColor("#FF0000")
        .setTitle(`New Application for ${message.author.username}`)
        .addFields(args.answers.map((a: { question: string; answer: string}) => ({ name: a.question, value: a.answer })))
        .addField('ID', message.author)
        .addField('Channel', message.channel)
      ));
    
      return message.reply(`Thank you, your application was submitted! Please wait while it is reviewed someone will get back with you soon.`);
  }
}