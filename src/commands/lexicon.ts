import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import Fuse from 'fuse.js';

import lexicon from '../data/lexicon.json';

const fuseOptions = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.6,
  distance: 100,
  useExtendedSearch: false,
  ignoreFieldNorm: true,
  sort: (a: { score: number }, b: { score: number }) => a.score - b.score,
  keys: [
    'term'
  ]
}

export default class LexiconCommand extends Command {

  private fuse: Fuse<any>;

  constructor() {
    super('lexicon', {
      aliases: ['lexicon', 'lex'],
      args: [
        {
          id: 'searchTerm',
          match: 'content',
          default: '',
        }
      ],
    });

    this.fuse = new Fuse(lexicon, fuseOptions);
  }

  exec(message: Message, args: any) {

    const results = this.fuse.search(args.searchTerm.trim())
    if (results.length == 0) {
      return message.channel.send("I'm sorry, I could not find any terms that match your query.")
    }

    return message.channel.send(results[0].item.description);
  }
}