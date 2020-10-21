import { Message, CommandDef } from '../lib/types';
import { getResponse } from '../lib/bputils';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_blueprint_name',
  alias: ['blueprint', 'bp'],
  args: [{
    key: 'searchTerm',
    name: 'command_blueprint_arg_searchterms',
    type: 'content',
  }],
  help: {
    description: 'command_blueprint_help_description',
    examples: [{
      args: 'command_blueprint_help_example_one_args',
      description: 'command_blueprint_help_example_one_description',
    },{
      args: 'command_blueprint_help_example_two_args',
      description: 'command_blueprint_help_example_two_description',
    },{
      args: 'command_blueprint_help_example_three_args',
      description: 'command_blueprint_help_example_three_description',
    }]
  },
  handler: async (message: Message, args: { searchTerm: string; mobile?: boolean; }) => {
    const response = await getResponse(args.searchTerm, !!args.mobile, message.prefix, message.lang);
    if (!response) {
      return message.channel.send(localize('command_blueprint_response_no_results', message.prefix, message.lang));
    }
    return message.channel.send(response);
  }
};

export default command;
