import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as settings from '../lib/settings';

export default class PingCommand extends Command {
  constructor() {
    super('prefix', {
      aliases: ['prefix'],
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'prefix',
          default: '!'
        }
      ],
    });
  }

  async exec(message: Message, args: any) {
    if (!message.guild) return;
    const oldSettings = settings.getSettings(message.guild.id);
    try {
      await settings.setPrefix(message.guild.id, args.prefix);
      return message.reply(`Prefix changed from ${oldSettings.prefix} to ${args.prefix}`);
    } catch (err) {
      console.error(`Failed to update prefix ${err}`);
      return message.reply(`Oh no! There was an error talking with our database. Prefix has not been changed.`)
    }
  }
}