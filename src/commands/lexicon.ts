import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';

import { isDevModeEnabled } from '../lib/access';
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
      userPermissions: () => {
        if (!isDevModeEnabled()) {
          return 'DevModeNotEnabled';
        }
        return null;
      },
      args: [
        {
          id: 'searchTerm',
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

    this.fuse = new Fuse(lexicon, fuseOptions);
  }

  exec(message: Message, args: any) {
    if (!args || args.help || !args.searchTerm) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
      .setTitle('Lexicon Command Help')
      .setDescription('This command will return the definition/meaning of a commonly used Eve term / phrase / emoticon.')
      .addField('Usage', `**${prefix}lexicon** item name
*aliases:* **${prefix}lex**, **${prefix}ship**, **${prefix}info**`));
    }

    const results = this.fuse.search(args.searchTerm.trim())
    if (results.length == 0) {
      return message.channel.send("I'm sorry, I could not find any terms that match your query.")
    }

    return message.channel.send(results[0].item.description);
  }
}