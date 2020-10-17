import { MessageEmbed, TextChannel, DMChannel, NewsChannel, User } from 'discord.js';
import { Message, CommandDef, CMProvider } from '../lib/types';
import { Client } from '../lib/types/Client';
import helpEmbeds from '../data/help_embed.json';
import { startCase } from 'lodash';


export function sendHelp(client: Client, prefix: string, destination: TextChannel | DMChannel | NewsChannel | User) {
  let help = new MessageEmbed()
      .setTitle('o7 Help')
      .setDescription(`All commands have their own help available by sending the word \"help\"  after the command.\n*for example: ${prefix}bp help*`)
      .setColor(7506394)
      .setURL('https://discord.gg/PfruVg4')
      .setThumbnail('https://i.imgur.com/kBKDFlS.png');

    const embeds = getHelpEmbeds(prefix, client, help);
    embeds.forEach(e => destination.send(e));
    helpEmbeds.embeds.forEach(e => destination.send(new MessageEmbed(e)));
}

function getHelpEmbeds(prefix: string, provider: CMProvider, initialEmbed: MessageEmbed): MessageEmbed[] {
  const embeds: MessageEmbed[] = [];
  let counter = 0;
  const done: { [id: string]: boolean; } = {};
  let embed = initialEmbed;
  Object.values(provider.commands).forEach(command => {
    if (command.type === 'module') return; // TODO: iterate modules for help
    if (command.def.owner || command.disabled || done[command.def.alias[0]]) return;
    embed.addField(`${prefix}${command.def.alias[0]}`, command.def.help?.description || startCase(command.def.name));
    done[command.def.alias[0]] = true;
    if (++counter == 25) {
      embeds.push(embed);
      embed = new MessageEmbed().setColor(7506394);
      counter = 0;
    }
  });

  if (counter > 0) {
    embeds.push(embed);
    embed = new MessageEmbed().setColor(7506394);
  }

  Object.values(provider.modules).forEach(module => {
    if (!module.commandGroup) return;
    embed.setTitle(`${startCase(module.name)}`);
    if (module.help) {
      embed.setDescription(module.help.description);
    }
    const moduledEmbeds = getHelpEmbeds(`${prefix}${module.commandGroup[0]} `, module, embed);
    embeds.push(...moduledEmbeds);
    embed = new MessageEmbed().setColor(7506394);
  });
  return embeds;
}

const command: CommandDef = {
  name: 'help',
  alias: ['help'],
  args: [{
    name: 'here',
    optional: true,
  }],
  handler: (message: Message, args: { here?: string }) => {
    const client = message.client as Client;
    const destination = args && args.here?.toLowerCase() === 'here' ? message.channel : message.author;
    sendHelp(client, message.prefix, destination);
  }
}

export default command;
