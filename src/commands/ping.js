import { Command } from 'discord-akairo';

export default class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping'],
      ownerOnly: true,
      channel: 'guild',
    });
  }

  exec(message) {
    return message.reply('Pong!');
  }
}