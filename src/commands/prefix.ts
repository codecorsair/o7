import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
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
        },
        {
          id: 'help',
          match: 'flag',
          flag: 'help'
        }
      ],
    });
  }

  async exec(message: Message, args: any) {
    if (!message.guild) return;

    if (!args || args.help || !args.system || !args.resource || !args.range) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
      .setTitle('Planetary Resources Search Command Help')
      .setDescription('This command will change the prefix this bot will respond to on this Discord server. **Only an Administrator may run this command**')
      .addField('Usage', `**${prefix}prefix** newprefix`));
    }

    try {
      await settings.setPrefix(message.guild.id, args.prefix);
      return message.reply(`Prefix changed to ${args.prefix}`);
    } catch (err) {
      console.error(`Failed to update prefix ${err}`);
      return message.reply(`Oh no! There was an error talking with our database. Prefix has not been changed.`)
    }
  }
}