import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as mongo from '../lib/db';
import * as settings from '../lib/settings';

export default class InitGuildsCommand extends Command {
  constructor() {
    super('initguilds', {
      aliases: ['initguilds'],
      ownerOnly: true,
    });
  }

  async exec(message: Message) {
    const now = new Date();
    message.reply(`Starting initialization of guild settings for ${this.client.guilds.cache.size} guilds...`);
    const guildDocs = this.client.guilds.cache.map(g => settings.defaultSettings(g.id));
    const client = mongo.getClient();
    let insertedCount = 0;
    try {
      await client.connect();
      const result = await client.getDb().collection(mongo.collections.settings).insertMany(guildDocs);
      insertedCount = result.insertedCount;
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
    message.reply(`Initialization of guilds completed with ${insertedCount} documented inserted in ${new Date().getTime() - now.getTime()}ms.`);
  }
}