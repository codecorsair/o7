import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as mongo from '../lib/db';
import * as settings from '../lib/settings';

export default class ResetGuildsCommand extends Command {
  constructor() {
    super('resetguilds', {
      aliases: ['resetguilds'],
      ownerOnly: true,
      args: [
        {
          id: 'affirm',
          type: 'text',
          prompt: {
            start: 'This will drop all settings and re-initialize guilds to default settings.\n' +
                    'Only do this in extrme circumstances! People will be mad! :angry:\n\n' +
                    '**Are you sure you really want to do this?**\n' +
                    '*Type `affirm` to execute this action, or anything else to cancel.*',
          }
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    
    if (!args || args.affirm !== 'affirm') {
      message.reply(`Phew! That was a close one.... reset aborted.`);
      return;
    }
    
    const now = new Date();
    message.reply(`Starting reset of guild settings for ${this.client.guilds.cache.size} guilds...`);
    const guildDocs = this.client.guilds.cache.map(g => settings.defaultSettings(g.id));
    const client = mongo.getClient();
    let insertedCount = 0;
    try {
      await client.connect();
      const deleteResult = await client.getDb().collection(mongo.collections.settings).deleteMany({});
      message.reply(`removed ${deleteResult.deletedCount} settings documents.`)
      const result = await client.getDb().collection(mongo.collections.settings).insertMany(guildDocs);
      insertedCount = result.insertedCount;
      guildDocs.forEach(g => settings.reset(g.guildId));
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
    message.reply(`Reset of guild settings completed with ${insertedCount} documents inserted in ${new Date().getTime() - now.getTime()}ms.`);
  }
}