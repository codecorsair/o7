import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as mongo from '../lib/db';

export default class DeleteGuildDataCommand extends Command {
  constructor() {
    super('deleteguilddata', {
      aliases: ['deleteguilddata'],
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'confirmation',
          prompt: {
            start: '**Warning!** this will delete all saved data for this server (guild).\nThere is no undo.\n\nTo continue reply with "Confirm".',
          }
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!message.guild) {
      return message.channel.send('This command can only be sent from within a guild.');
    }

    if (!args || !args.confirmation || args.confirmation !== 'Confirm') {
      return message.channel.send(`Phew! That was a close one.... delete aborted.`);
    }

    message.channel.send(`Attempting to delete all data for this guild, please wait...`);
    const guildId = message.guild.id;
    const client = mongo.getClient();
    try {
      await client.connect();
      let result = await client.getDb().collection(mongo.collections.settings).deleteOne({ guildId });
      if (result.result.ok) {
        message.channel.send('...settings deleted...');
      };

      result = await client.getDb().collection(mongo.collections.appconfig).deleteOne({ id: guildId });
      if (result.result.ok) {
        message.channel.send('...application config deleted...');
      };

      return message.channel.send('All data for this guild has been deleted!');
    } catch (err) {
      console.error(`Failed to reset guild data. ${err}`);
    }

    return message.channel.send('Oh no! something went wrong, please inform a developer!');
  }
}