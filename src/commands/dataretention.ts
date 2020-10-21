import { Message, CommandDef } from '../lib/types';
import { MessageEmbed } from 'discord.js';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_dataretention_name',
  alias: ['dataretention'],
  handler: (message: Message) => {
    message.author.send(new MessageEmbed()
      .setTitle(localize('command_dataretention_embed_title', message.prefix, message.lang))
      .setDescription(localize('command_dataretention_embed_desc', message.prefix, message.lang))
      .addField(localize('command_dataretention_embed_guild_field_name', message.prefix, message.lang), localize('command_dataretention_embed_guild_field_value', message.prefix, message.lang))
      .addField(localize('command_dataretention_embed_user_field_name', message.prefix, message.lang), localize('command_dataretention_embed_user_field_value', message.prefix, message.lang)))
  }
};

export default command;
