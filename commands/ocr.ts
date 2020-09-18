import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { extractText } from '../lib/tesseract';
import Fuse from 'fuse.js';

export default class OCRCommand extends Command {
  constructor() {
    super('ocr', {
      aliases: ['ocr'],
      ownerOnly: true,
      args: [
        {
          id: 'imgUrl',
          type: 'attachmentOrLink',
          prompt: {
            start: 'Please post a link to an image.'
          }
        },
        {
          id: 'name',
          type: 'content',
          prompt: {
            start: 'Please enter your character name as displayed in the image. (Include your corporation tag if it shows in the image)',
          }
        }
      ] 
    });
  }

  async exec(message: Message, args: any) {
    if (!args || !args.imgUrl || !args.name) {
      message.reply('Please supply a url to an image to this command.')
      return;
    }
    message.reply('Exctracting text, please wait...');
    try {
      const rectMultiplier = {
        left: 0.40,
        top: 0.15,
        width: 0.37,
        height: 0.10
      };

      const text = await extractText(args.imgUrl, rectMultiplier);
      
      const fuse = new Fuse([args.name], {
        includeScore: true,
        threshold: 0.3,
      });

      const searchResult = fuse.search(text);

      if (searchResult.length == 0) {
        message.reply(`Match failed with no results for ${text}`);
        return;
      }
      return message.reply(`Matched ${text} with ${args.name} with a score of ${searchResult[0].score}`);
    } catch (err) {
      console.error(err);
      message.reply(`Failed to process image.`);
      return;
    }
  }
}