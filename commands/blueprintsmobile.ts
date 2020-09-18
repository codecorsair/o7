import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { getResponse } from '../lib/bputils';

export default class BlueprintCommand extends Command {
  constructor() {
    super('blueprintm', {
      aliases: ['bpm', 'blueprintm'],
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
    const response = await getResponse(args.value, true);
    if (!response) {
      return message.reply(`I'm sorry, I couldn't find anything for those search terms.`)
    }
    return message.reply(response);
  }
}
