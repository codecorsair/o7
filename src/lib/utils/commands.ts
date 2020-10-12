import { isArray, isEmpty, startCase } from 'lodash';
import { MessageEmbed, Collection } from 'discord.js';
import { isHelp, parseArgs } from '../utils/args';
import { Message, DiscordPermissions, Command, Module } from '../types';
import { getFiles } from './getFiles';

// Just a quick check, things can still be wrong.
function isValid(command: Command, path: string) {
  if (!command.name || typeof command.name !== 'string') {
    console.error(`Invalid command at ${path}; 'name' is undefined or not a string.`);
    return false;
  }

  if (!command.alias || !isArray(command.alias) || isEmpty(command.alias)) {
    console.error(`Invalid command at ${path}; 'alias' is undefined, not an array, or empty.`);
    return false;
  }

  if (!command.handler || typeof command.handler !== 'function') {
    console.error(`Invalid command at ${path}; 'handler' is undefined or not a function.`);
    return false;
  }
  return true;
}

export async function loadCommands(directory: string, target: { commands: Collection<string, Command | Module>; }) {
  for await (const path of getFiles(directory, 0, 0, fileName => fileName.endsWith('.js'))) {
    const c = require(path).default as Command;
    if (isValid(c, path)) {
      c.type = 'command';
      c.alias.forEach(a => {
        const alias = a.toLowerCase();
        if (target.commands.has(alias)) {
          console.error(`Error loading command. ${path} comtains duplicate alias '${alias}'.`);
          return;
        }
        target.commands.set(alias, c)
      });
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

export async function processCommand(
  message: Message,
  commandProvider: { commands: Collection<string, Command | Module>; },
  content: string,
  prefix: string) {
  const [c, args] = content.split(/ (.+)/);
  const cmdString = c.toLowerCase();
  if (!commandProvider.commands.has(cmdString)) return;
  try {
    const command = commandProvider.commands.get(cmdString);
    if (!command || command.disabled) return;

    if (command.type === 'module') {
      return await processCommand(message, command, args, `${prefix}${(command.commandGroup as any)[0]} `);
    }

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
      return true;
    } else {
      const parsedArgs = await parseArgs(command, args, message);
      if (parsedArgs?.failed) {
        return message.sendHelp();
      }
      command.handler(message, parsedArgs?.args);
      return true;
    }

  } catch (err) {
    console.error(err);
    message.channel.send(`I'm sorry, there was a problem executing that command.`);
  }
}
