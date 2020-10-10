import { Message, Command } from '../lib/types';
import { getResponse } from '../lib/bputils';

const command: Command = {
  name: 'blueprint',
  alias: ['blueprint', 'bp'],
  args: [{
    name: 'searchTerm',
    type: 'content',
  }],
  help: {
    description: 'This command will return a list of all the resources and costs associated to build a given blueprint. Optionally, the resource and time costs will be adjusted based on skill levels, if provided.',
    examples: [{
      args: 'mk5 hob',
      description: 'Returns the resources and costs for a MK5 Hobgoblin at base rates for an unskilled character.',
    },{
      args: 'caracal navy 5/5/2',
      description: 'Returns the resources and costs for a Caracal Navy Issue adjusted for a character with Cruiser Manufacturing 5, Advanced Cruiser Manufacturing 5, and Expert Cruiser Manufacturing 2.',
    },{
      args: 'vexor 5/5/2 4/1/0',
      description: 'Returns the resources and costs for a Vexor adjusted for a character with Cruiser Manufacturing 5, Advanced Cruiser Manufacturing 5, and Expert Cruiser Manufacturing 2 and Accounting 4, Advanced Accounting 1, and Expert Accounting 0.',
    }]
  },
  handler: async (message: Message, args: { searchTerm: string; mobile?: boolean; }) => {
    const response = await getResponse(args.searchTerm, !!args.mobile);
    if (!response) {
      return message.channel.send(`I'm sorry, I couldn't find anything for those search terms.`)
    }
    return message.channel.send(response);
  }
};

export default command;
