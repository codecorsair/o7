import { Message, MessageEmbed } from 'discord.js';
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
    if (!args || args.help || !args.value) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
        .setTitle('Blueprint Command Help')
        .setDescription('This command will return a list of all the resources and costs associated to build a given blueprint. Optionally, the resource and time costs will be adjusted based on skill levels, if provided.')
        .addField('Usage', `**${prefix}blueprintm** item name (#/#/# - optional skill levels)
*alias:* **${prefix}bpm**

**examples:**
\`${prefix}bpm mk5 hob\`
-> *returns the resources and costs for a MK5 Hobgoblin at base rates for an unskilled character*

\`${prefix}bpm caracal navy 5/5/2\`
-> *returns the resources and costs for a Caracal Navy Issue adjusted for a character with Cruiser Manufacturing 5, Advanced Cruiser Manufacturing 5, and Expert Cruiser Manufacturing 2*`));
    }

    const response = await getResponse(args.value, true);
    if (!response) {
      return message.reply(`I'm sorry, I couldn't find anything for those search terms.`)
    }
    return message.reply(response);
  }
}
