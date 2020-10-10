import { MessageEmbed, TextChannel, DMChannel, NewsChannel, User } from 'discord.js';
import { Message, Command } from '../lib/types';
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
    client.commands.forEach(command => {
      if (command.owner || command.disabled) return;
      help.addField(`${prefix}${command.alias[0]}`, command.help?.description || startCase(command.name));
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

const command: Command = {
  name: 'help',
  alias: ['help'],
  args: [{
    name: 'here',
    type: 'flag',
    optional: true,
  }],
  handler: (message: Message, args: { here?: boolean }) => {
    const client = message.client as Client;
    const destination = args && args.here ? message.channel : message.author;
    sendHelp(client, message.prefix, destination);
  }
}

export default command;
