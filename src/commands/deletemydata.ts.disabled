import { Message, CommandDef } from '../lib/types';

const command: CommandDef = {
  name: 'deletemydata',
  alias: ['deletemydata'],
  args: [{
    name: 'confirmation',
    prompt: {
      start: `**Warning!** this will delete all saved data for your Discord user.\nThere is no undo.\n\nTo confirm click ✅`,
      reactions: [{
        emoji: '✅',
        value: true,
      }]
    },
  }],
  handler: (message: Message, args: { confirmation: boolean; }) => {
    if (args.confirmation) {
      return message.channel.send('This bot does not store any user data at this time, there is nothing to delete!');
    }
    return message.channel.send(`Phew! That was a close one.... delete aborted. `);
  }
};

export default command;
