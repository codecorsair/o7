import fs from 'fs';
import { isArray, isEmpty, startCase } from 'lodash';
import { Command } from '../types/Command'
import { Message as DJSMessage, MessageEmbed } from 'discord.js';
import { isHelp, parseArgs } from '../utils/args';
import { Client, Message, DiscordPermissions } from '../types';
import * as settings from '../settings';
import config from '../../config.json';


function requireCommandsFromDir(directory: string) {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.js'))
    .map(file => ({
      path: `${directory}/${file}`,
      command: require(`${directory}/${file}`).default as Command,
    }));
}

function isValid(command: Command) {
  if (!command.name) return false;
  if (!command.handler) return false;
  if (!command.alias || !isArray(command.alias) || isEmpty(command.alias)) return false;
  return true;
}

function getPrefix(message: DJSMessage) {
  if (message.guild) {
    const prefix = settings.getSettings(message.guild.id).prefix;
    (message as any).prefix = prefix;
    return prefix;
  }
  (message as any).prefix = config.prefix;
  return config.prefix;
}

export function loadCommands(directory: string, client: Client) {
  const pcs = requireCommandsFromDir(directory);
  for (const pc of pcs) {
    if (!isValid(pc.command)) {
      console.error(`Error loading command. ${pc.path} is not a valid Command.`);
      continue;
    }
    for (const alias of pc.command.alias) {
      const a = alias.toLowerCase();
      if (client.commands.has(a)) {
        console.error(`Error loading command. ${pc.path} contains duplicated command '${a}'.`);
        continue;
      }
      client.commands.set(a, pc.command);
    }
  }
}

export function getHelpEmbed(command: Command, prefix: string) {
  const embed = new MessageEmbed().setTitle(`${startCase(command.name)} Command Help`)
    .setColor(command.help?.color || '#fff500');
  embed.addField('Usage', `**${prefix}${command.alias[0]}** ${command.args && typeof command.args !== 'function' ? command.args.map(arg => arg.optional ? `(${arg.name} *optional)` : arg.name).join(' ') : ''}
${command.alias.length > 0 ? `*alias:* ${command.alias.slice(1).map(a => `**${prefix}${a}**`).join(', ')}` : ''}`);
  if (command.help) {
    embed.setDescription(command.help?.description);
    if (command.help.examples) {
      embed.addField('Examples:', command.help.examples.map(e => `\`${prefix}${command.alias[0]} ${e.args}\`${e.description ? `\n->${e.description}` : ''}`).join('\n\n'));
    }
  }
  return embed;
}

export async function processCommand(djsMessage: DJSMessage) {
  const content = djsMessage.content;
  const message = djsMessage as Message;

  const prefix = getPrefix(djsMessage);
  if (djsMessage.author.bot || !content.startsWith(prefix)) return;

  const [c, args] = djsMessage.content.slice(prefix.length).trim().split(/ (.+)/);
  const cmdString = c.toLowerCase();
  if (!message.client.commands.has(cmdString)) return;
  try {
    const command = message.client.commands.get(cmdString);
    if (!command || command.disabled) return;

    if (command.channel) {
      if (command.channel === 'guild' && !message.guild) return;
      if (command.channel === 'dm' && message.guild) return;
    }

    if (command.owner && !message.client.owners.find(s => s === message.author.id)) return;


    if (command.userPermissions) {
      if (typeof command.userPermissions === 'function' && !command.userPermissions(message)) return;
      for (const permission of command.userPermissions as DiscordPermissions[]) {
        if (!message.member?.hasPermission(permission)) {
          return;
        }
      }
    }

    if (command.clientPermissions) {
      for (const permission of command.clientPermissions) {
        if (!message.guild?.me?.hasPermission(permission)) {
          return message.author.send(`It looks like I don't have the required permissions for the **${startCase(command.name)}** command on **${message.guild?.name}**.\nI need the following permission${command.clientPermissions.length > 1 ? 's' : ''} ${command.clientPermissions.map(p => `\`${p}\``).join(' ')}.`);
        }
      }
    }

    message.prefix = prefix;
    message.sendHelp = () => message.channel.send(getHelpEmbed(command, prefix));
    
    if (isHelp(command, args)) {
      return message.sendHelp();
    }

    if (typeof command.args === 'function') {
      const result = await command.args(message, command);
      if (!result) {
        return message.sendHelp();
      }
      command.handler(message, result);
    } else {
      const parsedArgs = await parseArgs(command, args, message);
      if (parsedArgs?.failed) {
        return message.sendHelp();
      }
      command.handler(message, parsedArgs?.args);
    }
    
  } catch (err) {
    console.error(err);
    djsMessage.channel.send(`I'm sorry, there was a problem executing that command.`);
  }
}
