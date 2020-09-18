import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { extractText } from '../lib/tesseract';
import Fuse from 'fuse.js';
import * as settings from '../lib/settings';
import * as mongo from '../lib/db';

export interface Verified {
  guildId: string;
  authorId: string;
  name: string;
  imageUrl: string;
}

export default class VerifyNowCommand extends Command {
  constructor() {
    super('verifynow', {
      aliases: ['verifynow'],
      channel: 'guild',
      ownerOnly: true,
      args: [
        {
          id: 'imgUrl',
          type: 'attachmentOrLink',
          prompt: {
            start: 'Please paste/upload an image or provide a link to an image now.',
          }
        },
        {
          id: 'name',
          type: 'content',
          prompt: {
            start: 'Please enter your character name as displayed in the image.\nThis must include your guild tag if it is present.'
          }
        }
      ] 
    });
  }

  async exec(message: Message, args: any) {
    if (!args || !args.imgUrl || !args.name || !message.guild) {
      message.channel.send('Invalid input.')
      return;
    }
    message.channel.send('Please wait while I examine the image...');
    try {
      const nameRectMultiplier = {
        left: 0.40,
        top: 0.15,
        width: 0.37,
        height: 0.10
      };

      const text = await extractText(args.imgUrl, nameRectMultiplier);
      
      const fuse = new Fuse([args.name], {
        includeScore: true,
        threshold: 0.3,
      });

      const searchResult = fuse.search(text);

      if (searchResult.length == 0) {
        message.channel.send(`I'm sorry, I couldn't match your name with the provided image.`);
        return;
      }

      const verified: Verified = {
        authorId: message.author.id,
        guildId: message.guild.id,
        imageUrl: args.imgUrl,
        name: args.name,
      }

      const client = mongo.getClient();
      try {
        await client.connect();
        await client.getDb()
          .collection(mongo.collections.verification)
          .updateOne({ guildId: verified.guildId, authorId: verified.authorId }, { $set: verified }, { upsert: true });
      } catch (err) {
        console.error(err);
        return message.channel.send(`Oops. Something went wrong, please wait a minute and try again.`);
      }

      return message.channel.send(`Success! You're now verified.\nYou can now use the command ${settings.getSettings(message.guild.id).prefix}verified`);
    } catch (err) {
      console.error(err);
      message.channel.send(`Failed to process image.`);
      return;
    }
  }
}