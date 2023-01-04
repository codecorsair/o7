// import { isArray, isEmpty, startCase } from 'lodash';
// import { Collection } from 'discord.js';
// import { isHelp, parseArgs } from '../utils/args';
// import { Message, DiscordPermissions, Command, Module } from '../types';
import { Client } from '../types';
import { getFiles } from './getFiles';
// import { EmbedBuilder } from '@discordjs/builders';

// Just a quick check, things can still be wrong.
// function isValid(command: Command, path: string) {
//   if (!command.name || typeof command.name !== 'string') {
//     console.error(`Invalid command at ${path}; 'name' is undefined or not a string.`);
//     return false;
//   }

//   if (!command.alias || !isArray(command.alias) || isEmpty(command.alias)) {
//     console.error(`Invalid command at ${path}; 'alias' is undefined, not an array, or empty.`);
//     return false;
//   }

//   if (!command.handler || typeof command.handler !== 'function') {
//     console.error(`Invalid command at ${path}; 'handler' is undefined or not a function.`);
//     return false;
//   }
//   return true;
// }

// export async function loadCommands(directory: string, target: { commands: Collection<string, Command | Module>; }) {
//   for await (const path of getFiles(directory, 0, 0, fileName => fileName.endsWith('.js'))) {
//     const c = require(path).default as Command;
//     if (isValid(c, path)) {
//       c.type = 'command';
//       c.alias.forEach(a => {
//         const alias = a.toLowerCase();
//         if (target.commands.has(alias)) {
//           console.error(`Error loading command. ${path} contains duplicate alias '${alias}'.`);
//           return;
//         }
//         target.commands.set(alias, c)
//       });
//     }
//   }
// }

export async function registerCommands(client: Client) {
  for (const [commandName, command] of client.commands.entries()) {
    client.application?.commands.create(command.data(commandName));
    console.log(`Registered command ${commandName}`);
  }
}

export async function loadCommands(directory: string, client: Client) {
  for await (const path of getFiles(directory, 0, 0, fileName => fileName.endsWith('.js'))) {
    const command = require(path).default;
    command.aliases.forEach(a => {
      const alias = a.toLowerCase();
      if (client.commands.has(alias) && !command.disabled) {
        console.error(`Error loading command. ${command.aliases[0]} contains duplicate alias '${alias}'.`);
        return
      }
      client.commands.set(alias, command);
    });
  }
}

// export function getHelpEmbed(command: Command, prefix: string) {
//   const embed = new EmbedBuilder().setTitle(`${startCase(command.data.name)} Command Help`)
//     .setColor( 0xfff500);
//   embed.addFields([
//     {
//       name: "Usage",
//       value: `**${prefix}${command.data.name}** ${
//         command.data.options
//           ? command.data.options
//               .map((arg) =>
//                 arg.toJSON().required
//                   ? `(${arg.toJSON().name} *optional)`
//                   : arg.toJSON().name
//               )
//               .join(" ")
//           : ""
//       }`,
//     },
//   ]);
//   if (command.help) {
//     embed.setDescription(command.help?.description);
//     if (command.help.examples) {
//       embed.addFields([{
//         name: 'Examples:', value: command.help.examples.map(e => `\`${prefix}${command.data.name} ${e.args}\`${e.description ? `\n->${e.description}` : ''}`).join('\n\n')
//       }]);
//     }
//   }
//   return embed;
// }

// export async function processCommand(
//   interaction: CommandInteraction,
//   commandProvider: { commands: Collection<string, Command /*| Module*/>; },
//   content: string,
//   prefix: string) {
//   const [c, args] = content.split(/ (.+)/);
//   const cmdString = c.toLowerCase();
//   if (!commandProvider.commands.has(cmdString)) return;
//   try {
//     const command = commandProvider.commands.get(cmdString);
//     if (!command || command.disabled) return;

//     // if (command.type === 'module') {
//     //   return await processCommand(message, command, args, `${prefix}${(command.commandGroup as any)[0]} `);
//     // }

//     if (command.channel) {
//       if (command.channel === "guild" && !interaction.guild) return;
//       if (command.channel === "dm" && interaction.guild) return;
//     }

//     // if (command.owner && !message.client.owners.find(s => s === message.author.id)) return;

//     // if (command.userPermissions) {
//     //   if (typeof command.userPermissions === 'function' && !command.userPermissions(message)) return;
//     //   for (const permission of command.userPermissions as DiscordPermissions[]) {
//     //     if (!message.member?.hasPermission(permission)) {
//     //       return;
//     //     }
//     //   }
//     // }

//     // if (command.clientPermissions) {
//     //   for (const permission of command.clientPermissions) {
//     //     if (!message.guild?.me?.hasPermission(permission)) {
//     //       return message.author.send(`It looks like I don't have the required permissions for the **${startCase(command.name)}** command on **${message.guild?.name}**.\nI need the following permission${command.clientPermissions.length > 1 ? 's' : ''} ${command.clientPermissions.map(p => `\`${p}\``).join(' ')}.`);
//     //     }
//     //   }
//     // }

//     const sendHelp = () => interaction.reply(`${getHelpEmbed(command, prefix)}`);

//     if (isHelp(command, args)) {
//       return sendHelp();
//     }

//     if (typeof command.args === 'function') {
//       const result = await command.args(message, command);
//       if (!result) {
//         return message.sendHelp();
//       }
//       command.handler(message, result);
//       return true;
//     } else {
//       const parsedArgs = await parseArgs(command, args, message);
//       if (parsedArgs?.failed) {
//         return message.sendHelp();
//       }
//       command.handler(message, parsedArgs?.args);
//       return true;
//     }

//   } catch (err) {
//     console.error(err);
//     message.channel.send(`I'm sorry, there was a problem executing that command.`);
//   }
// }
