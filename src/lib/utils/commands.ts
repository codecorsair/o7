import { isArray, isEmpty, startCase } from 'lodash';
import { MessageEmbed } from 'discord.js';
import { isHelp, parseArgs } from '../utils/args';
import { Message, DiscordPermissions, CommandProvider, Command, CommandDef } from '../types';
import { getFiles } from './getFiles';
import { LANG, localize, _localize } from '../localize';

// Just a quick check, things can still be wrong.
function isValid(command: CommandDef, path: string) {
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

export async function loadCommands(directory: string, target: CommandProvider) {
  for await (const path of getFiles(directory, 0, 0, fileName => fileName.endsWith('.js'))) {
    const def = require(path).default as Command;
    if (isValid(def, path)) {
      def.alias.forEach(a => {
        registerAlias(path, a, def, target);
      });
    }
  }
}

function registerAlias(path: string, alias: string, def: CommandDef, target: CommandProvider) {
  if (target.commands[alias]) {
    console.error(`Error loading command. ${path} comtains duplicate alias '${alias}'.`);
    return;
  }
  target.commands[alias] = {
    type: 'command',
    ...def,
  };
}

export function getHelpEmbed(command: Command, prefix: string, lang: LANG) {
  const name = localize(command.name, prefix, lang) || command.name;
  const embed = new MessageEmbed().setTitle(`${name} ${localize('command_help', prefix, lang)}`)
    .setColor(command.help?.color || '#fff500');
  embed.addField(localize('usage', prefix, lang), `**${prefix}${command.alias[0]}** ${command.args && typeof command.args !== 'function' ? command.args.map(arg => arg.optional ? `(${localize(arg.name, prefix, lang)} ${localize('optional', prefix, lang)})` : arg.name).join(' ') : ''}
${command.alias.length > 0 ? `*alias:* ${command.alias.slice(1).map(a => `**${prefix}${a}**`).join(', ')}` : ''}`);
  if (command.help) {
    embed.setDescription(localize(command.help.description, prefix, lang));
    if (command.help.examples) {
      embed.addField(localize('examples', prefix, lang), command.help.examples.map(e => `\`${prefix}${command.alias[0]} ${localize(e.args, prefix, lang)}\`${e.description ? `\n->${localize(e.description, prefix, lang)}` : ''}`).join('\n\n'));
    }
  }
  return embed;
}

export async function processCommand(
  message: Message,
  commandProvider: CommandProvider,
  content: string,
  prefix: string) {
  const [c, args] = content.split(/ (.+)/);
  const cmdString = c.toLowerCase();
  if (!commandProvider.commands[cmdString]) return;
  try {
    const commandOrModule = commandProvider.commands[cmdString];
    if (!commandOrModule || commandOrModule.disabled) return;
    if (commandOrModule.type === 'module') {
      return await processCommand(message, commandOrModule, args, `${prefix}${cmdString} `);
    }

    const command = commandOrModule;
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

    message.sendHelp = () => message.channel.send(getHelpEmbed(commandOrModule, prefix, message.lang));

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
