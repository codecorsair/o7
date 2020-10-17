import { isArray, isEmpty, startCase } from 'lodash';
import { MessageEmbed } from 'discord.js';
import { isHelp, parseArgs } from '../utils/args';
import { Message, DiscordPermissions, CommandDef, CommandProvider, Command } from '../types';
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
    const def = require(path).default as CommandDef;
    if (isValid(def, path)) {
      def.alias.forEach(a => {
        const alias_en = _localize(a, 'en');
        if (alias_en) {
          registerAlias(path, alias_en, 'en', def, target);
        } else {
          registerAlias(path, a, 'en', def, target);
        }

        const alias_ru = _localize(a, 'ru');
        if (alias_ru) {
          registerAlias(path, alias_ru, 'ru', def, target);
        }
      });
    }
  }
}

function registerAlias(path: string, alias: string, lang: LANG, def: CommandDef, target: CommandProvider) {
  if (target.commands[alias]) {
    console.error(`Error loading command. ${path} comtains duplicate alias '${alias}'.`);
    return;
  }
  target.commands[alias] = {
    type: 'command',
    def,
    lang,
    disabled: !!def.disabled,
  };
}

export function getHelpEmbed(command: Command, prefix: string) {
  const name = _localize(command.def.name, command.lang) || command.def.name;
  const embed = new MessageEmbed().setTitle(`${name} ${localize("help_command_help", command.lang)}`)
    .setColor(command.def.help?.color || '#fff500');
  embed.addField('Usage', `**${prefix}${command.def.alias[0]}** ${command.def.args && typeof command.def.args !== 'function' ? command.def.args.map(arg => arg.optional ? `(${arg.name} *optional)` : arg.name).join(' ') : ''}
${command.def.alias.length > 0 ? `*alias:* ${command.def.alias.slice(1).map(a => `**${prefix}${a}**`).join(', ')}` : ''}`);
  if (command.def.help) {
    embed.setDescription(command.def.help?.description);
    if (command.def.help.examples) {
      embed.addField('Examples:', command.def.help.examples.map(e => `\`${prefix}${command.def.alias[0]} ${e.args}\`${e.description ? `\n->${e.description}` : ''}`).join('\n\n'));
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

    const commandDef = commandOrModule.def;
    if (!message.lang) message.lang = commandOrModule.lang;

    if (commandDef.channel) {
      if (commandDef.channel === 'guild' && !message.guild) return;
      if (commandDef.channel === 'dm' && message.guild) return;
    }

    if (commandDef.owner && !message.client.owners.find(s => s === message.author.id)) return;

    if (commandDef.userPermissions) {
      if (typeof commandDef.userPermissions === 'function' && !commandDef.userPermissions(message)) return;
      for (const permission of commandDef.userPermissions as DiscordPermissions[]) {
        if (!message.member?.hasPermission(permission)) {
          return;
        }
      }
    }

    if (commandDef.clientPermissions) {
      for (const permission of commandDef.clientPermissions) {
        if (!message.guild?.me?.hasPermission(permission)) {
          return message.author.send(`It looks like I don't have the required permissions for the **${startCase(commandDef.name)}** command on **${message.guild?.name}**.\nI need the following permission${commandDef.clientPermissions.length > 1 ? 's' : ''} ${commandDef.clientPermissions.map(p => `\`${p}\``).join(' ')}.`);
        }
      }
    }

    message.sendHelp = () => message.channel.send(getHelpEmbed(commandOrModule, prefix));

    if (isHelp(commandDef, args)) {
      return message.sendHelp();
    }

    if (typeof commandDef.args === 'function') {
      const result = await commandDef.args(message, commandDef);
      if (!result) {
        return message.sendHelp();
      }
      commandDef.handler(message, result);
      return true;
    } else {
      const parsedArgs = await parseArgs(commandDef, args, message);
      if (parsedArgs?.failed) {
        return message.sendHelp();
      }
      commandDef.handler(message, parsedArgs?.args);
      return true;
    }

  } catch (err) {
    console.error(err);
    message.channel.send(`I'm sorry, there was a problem executing that command.`);
  }
}
