import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import * as settings from '../lib/guild-settings';

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
    const newSettings = {
      ...oldSettings,
      prefix: args.prefix,
    };
    try {
      await settings.updateSettings(newSettings);
    } catch (err) {
      console.error(`Failed to update prefix ${err}`);
      return message.reply(`Oh no! There was an error talking with our database. Prefix has not been changed.`)
    }
    return message.reply(`Prefix changed from ${oldSettings.prefix} to ${newSettings.prefix}`);
  }
}