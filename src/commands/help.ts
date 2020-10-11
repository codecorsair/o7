import { MessageEmbed, TextChannel, DMChannel, NewsChannel, User } from 'discord.js';
import { Message, CommandDef } from '../lib/types';
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


    let counter = 0;
    const done: { [id: string]: boolean; } = {};
    client.commands.forEach(command => {
      if (command.type === 'module') return; // TODO: iterate modules for help
      if (command.owner || command.disabled || done[command.alias[0]]) return;
      help.addField(`${prefix}${command.alias[0]}`, command.help?.description || startCase(command.name));
      done[command.alias[0]] = true;
      if (++counter == 25) {
        destination.send(help);
        help = new MessageEmbed();
        counter = 0;
      }
    });

    if (counter > 0) {
      destination.send(help);
    }

    helpEmbeds.embeds.forEach(e => destination.send(new MessageEmbed(e)));
}

const command: CommandDef = {
  name: 'help',
  alias: ['help'],
  args: [{
    name: 'here',
    type: 'flag',
    optional: true,
  }],
  handler: (message: Message, args: { here?: boolean }) => {
    const client = message.client as Client;
    console.log(args.here);
    const destination = args && args.here ? message.channel : message.author;
    sendHelp(client, message.prefix, destination);
  }
}

export default command;
