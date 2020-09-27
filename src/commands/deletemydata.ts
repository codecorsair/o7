import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteMyDataCommand extends Command {
  constructor() {
    super('deletemydata', {
      aliases: ['deletemydata'],
      args: [
        {
          id: 'confirmation',
          prompt: {
            start: '**Warning!** this will delete all saved data for your Discord user.\nThere is no undo.\n\nTo continue reply with "Confirm".',
          }
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!args || !args.confirmation || args.confirmation !== 'Confirm') {
      return message.channel.send(`Phew! That was a close one.... delete aborted.`);
    }

    return message.channel.send('This bot does not store any user data at this time, there is nothing to delete!');
  }
}