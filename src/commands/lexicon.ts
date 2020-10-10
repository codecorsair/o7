import Fuse from 'fuse.js';
import { Message, Command } from '../lib/types';
import { isDevModeEnabled } from '../lib/access';
import lexicon from '../data/lexicon.json';

const command: Command = {
  name: 'lexicon',
  alias: ['lexicon', 'lex'],
  userPermissions: isDevModeEnabled,
  args: [{
    name: 'searchTerm',
    type: 'content',
  }],
  help: {
    description: 'This command will return the definition/meaning of a commonly used Eve term / phrase / emoticon.',
  },
  handler: (message: Message, args: { searchTerm: string }) => {
    const results = fuse.search(args.searchTerm.trim())
    if (results.length == 0) {
      return message.channel.send("I'm sorry, I could not find any terms that match your query.")
    }

    return message.channel.send(results[0].item.description);
  }
};

export default command;

const fuseOptions = {
  minMatchCharLength: 1,
  keys: [
    'term',
  ],
};

const fuse = new Fuse(lexicon, fuseOptions);