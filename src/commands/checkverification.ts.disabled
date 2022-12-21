import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Verified } from './verifynow';
import * as mongo from '../lib/db';

export default class VerifiedCommand extends Command {
  constructor() {
    super('checkVerification', {
      aliases: ['checkVerification'],
      channel: 'guild',
      userPermissions: ['MANAGE_ROLES'],
      ownerOnly: true,
      args: [
        {
          id: 'user',
          type: 'user',
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!message.guild) return;
    const client = mongo.getClient();
    try {
      await client.connect();
      const verified = await client.getDb()
        .collection(mongo.collections.verification)
        .findOne<Verified>({ guildId: message.guild.id, authorId: args.user.id });
      if (!verified) {
        return message.channel.send(`${message.author} has not yet verified.`);
      }
      return message.channel.send(`${message.author} is verified as ${verified.name}`);
    } catch (err) {
      console.error(err);
      return message.channel.send(`Oops. Something went wrong, please wait a minute and try again.`);
    }
  }
}