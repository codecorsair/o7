import { TextChannel } from 'discord.js';
import { DMChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import { MessageReaction, Message } from 'discord.js';
import { Arg, Command, CommonEmojis } from '../types';
import { collectMessages, collectReactions } from './collectors';

export function isHelp(command: Command, args?: string) {
  if (!args && (typeof command.args !== 'function' && command.args && command.args.filter(a => !a.default && !a.optional && !a.prompt).length > 0)) return true;
  return args && (args === 'help' || args.indexOf('-h') > -1 || args.indexOf('--help') > -1);
}

export function parseType(arg: Arg, args: string, msg: Message, state: { channel: number; member: number; role: number; splitArgs: string[]; parsedArgs: any; }) {
  const channels = Array.from(msg.mentions.channels);
  const members = msg.mentions.members ? Array.from(msg.mentions.members) : [];
  const roles = Array.from(msg.mentions.roles);

  switch (arg.type) {
    case 'content':
      state.parsedArgs[arg.name] = args || arg.default;
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    default:
    case 'phrase':
      state.parsedArgs[arg.name] = state.splitArgs[0] || arg.default;
      state.splitArgs.splice(0, 1);
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'number':
      state.parsedArgs[arg.name] = parseFloat(state.splitArgs[0]) || arg.default;
      state.splitArgs.splice(0, 1);
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'channel':
      state.parsedArgs[arg.name] = channels[state.channel] && channels[state.channel][1] || arg.default;
      state.channel++;
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'member':
      state.parsedArgs[arg.name] = members[state.member] && members[state.member][1] || arg.default;
      state.member++;
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'role':
      state.parsedArgs[arg.name] = roles[state.role] && roles[state.role][1] || arg.default;
      state.role++;
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'flag':
      const index = state.splitArgs.findIndex(s => s === (arg.flag || arg.name));
      if (index > 0) {
        state.parsedArgs[arg.name] = state.splitArgs[index];
        state.splitArgs.splice(index, 1);
      } else if (arg.default) {
        state.parsedArgs[arg.name] = arg.default;
      }
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
    case 'restContent':
      state.parsedArgs[arg.name] = state.splitArgs.join(' ');
      state.splitArgs.splice(0, state.splitArgs.length);
      if (!arg.optional && !state.parsedArgs[arg.name]) return;
      return state.parsedArgs[arg.name];
  }
}

export async function parseArgs(command: Command, args: string, message: Message) {
  if (typeof command.args === 'function') return;
  if (!args && (!command.args || !command.args.some(a => a.prompt) || !command.args.some(a => a.default))) {
    return;
  } else if (!command.args) {
    return;
  }

  let failed = false;

  const argsState = {
    channel: 0,
    member: 0,
    role: 0,
    splitArgs: args && args.split(/ +/) || [],
    parsedArgs: <any>{},
  }
  for (const arg of command.args) {
    if (arg.prompt) {
      const startMessage = typeof arg.prompt.start === 'function' ? arg.prompt.start(message) : arg.prompt.start;
      let response: any;
      if (arg.prompt.reactions) {
        const promptMessage = await message.channel.send(startMessage);
        arg.prompt.reactions.forEach(async r => {
          let mr: any = undefined;
          if (typeof r.emoji === 'string') {
            mr = await promptMessage.react(r.emoji);
          } else {
            const re = message.client.emojis.cache.get(r.emoji.id);
            if (re) {
              mr = await promptMessage.react(re);
            }
          }
          if (!mr) {
            message.channel.send(`Failed to find emoji ${JSON.stringify(r.emoji)}.`);
            return { failed: true };
          }
        });
        const stopEmojiId = arg.prompt.stop || CommonEmojis.Cancel.id;
        const stopEmoji = message.client.emojis.cache.get(stopEmojiId);
        if (!stopEmoji) {
          message.channel.send(`Failed to find emoji ${stopEmojiId}`);
          return { failed: true };
        }
        await promptMessage.react(stopEmoji);
        response = await collectReactions(promptMessage,
          (r, u) => u.id === message.author.id && arg.prompt?.reactions ? [...arg.prompt.reactions.map(pr => typeof pr.emoji === 'string' ? pr.emoji : pr.emoji.name), stopEmoji.name].some(name => name === r.emoji.name) : true,
          (r, u) => u.id === message.author.id && r.emoji.id === stopEmojiId,
          { max: arg.prompt.infinite ? undefined : 1, time: arg.prompt.timeout || 60_000, resetTimerOnMessage: true},
          r => getReactionValue(r, arg));
        promptMessage.reactions.removeAll();
      } else {
        response = await askQuestionWithMessageResponse(startMessage, message.channel, arg);
        if (typeof response === 'undefined') {
          return { failed: true };
        }
      }
      argsState.parsedArgs[arg.name] = response;
    } else {
      if (!parseType(arg, args, message, argsState)) {
        return { failed: true };
      }
    }
  }

  return {
    failed,
    args: argsState.parsedArgs
  };
}


function getReactionValue(reaction: MessageReaction, arg: Arg) {
  if (!arg.prompt?.reactions) return;
  for (const pr of arg.prompt.reactions) {
    if (typeof pr.emoji === 'string') {
      if (pr.emoji === reaction.emoji.name) return pr.value;
    } else if (reaction.emoji.name === pr.emoji.name) {
      return pr.value;
    }
  }
}

export async function askQuestionWithMessageResponse(question: string, channel: TextChannel | DMChannel | NewsChannel, arg: Arg) {
  const message = await channel.send(question);
  return await collectMessages(message.channel,
    m => arg.prompt?.choices ? [...arg.prompt.choices, arg.prompt?.stop || 'stop'].some(c => c.toLowerCase() === m.content.toLowerCase()) : true,
    m => m.content === (arg.prompt?.stop || 'stop'),
    { max: arg.prompt?.infinite ? undefined : 1, time: arg.prompt?.timeout || 60_000, resetTimerOnMessage: true},
    m => parseType(arg, m.content, m, { channel: 0, member: 0, role: 0, splitArgs: m.content.split(/ +/), parsedArgs: {}}));
}
