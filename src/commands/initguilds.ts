import { Message, Command } from '../lib/types';
import * as mongo from '../lib/db';
import * as settings from '../lib/settings';

const command: Command = {
  name: 'initguilds',
  alias: ['initguilds'],
  owner: true,
  handler: async (message: Message) => {
    const now = new Date();
    message.reply(`Starting initialization of guild settings for ${message.client.guilds.cache.size} guilds...`);
    const guildDocs = message.client.guilds.cache.map(g => settings.defaultSettings(g.id));
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
};

export default command;
