import { Message, CommandDef } from '../lib/types';
import { MessageEmbed } from 'discord.js';
import dr from '../data/dataretention.json';

const command: CommandDef = {
  name: 'dataretention',
  alias: ['dataretention'],
  handler: (message: Message) => {
    dr.embeds.forEach(e => message.author.send(new MessageEmbed(e)));
  }
};

export default command;
