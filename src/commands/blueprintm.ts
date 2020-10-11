import { Message, CommandDef } from '../lib/types';
import blueprint from './blueprint';

const command: CommandDef = {
  ...blueprint,
  name: 'blueprint mobile',
  alias: ['blueprintm', 'bpm'],
  handler: (message: Message, args: { searchTerm: string; }) => blueprint.handler(message, {...args, mobile: true}),
};

export default command;
