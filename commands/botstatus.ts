import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class BotStatusCommand extends Command {
  constructor() {
    super('botstatus', {
      aliases: ['botstatus'],
      ownerOnly: true,
    });
  }

  exec(message: Message) {
    return message.reply(new MessageEmbed()
                        .setTitle('Bot Status')
                        .setDescription(`\
                          Active Guilds  ${this.client.guilds.cache.size}
                          `));
  }
}