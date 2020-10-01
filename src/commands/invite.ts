import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
  constructor() {
    super('invite', {
      aliases: ['invite', 'invitelink'],
    });
  }

  exec(message: Message) {
    return message.channel.send('<https://discord.com/oauth2/authorize?client_id=753820564665270333&scope=bot&permissions=3072>');
  }
}