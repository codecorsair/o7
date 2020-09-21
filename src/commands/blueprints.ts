import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { getResponse } from '../lib/bputils';

export default class BlueprintCommand extends Command {
  constructor() {
    super('blueprint', {
      aliases: ['bp', 'blueprint'],
      args: [
        {
          id: 'value',
          match: 'content',
          default: '',
        }
      ],
    });
  }

  async exec(message: Message, args: any) {
    const response = await getResponse(args.value, false);
    if (!response) {
      return message.reply(`I'm sorry, I couldn't find anything for those search terms.`)
    }
    return message.reply(response);
  }
}
