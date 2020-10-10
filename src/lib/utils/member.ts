import { Message } from '../types/Message'

export function getAuthorAsMember(message: Message) {
  if (!message.guild) return undefined;
  return message.client.guilds.cache.get(message.guild.id)?.members.cache.get(message.author.id);
}
