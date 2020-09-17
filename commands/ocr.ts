import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { extractText } from '../lib/tesseract';

export default class OCRCommand extends Command {
  constructor() {
    super('ocr', {
      aliases: ['ocr'],
      ownerOnly: true,
      args: [
        {
          id: 'imgUrl',
          type: 'url',
        }
      ] 
    });
  }

  async exec(message: Message, args: any) {
    if (!args || !args.imgUrl) {
      message.reply('Please supply a url to an image to this command.')
      return;
    }
    message.reply('Exctracting text, please wait...');
    try {
      const text = await extractText(args.imgUrl.href);
      return message.reply(text);
    } catch (err) {
      console.error(err);
      message.reply(`Failed to process image.`);
      return;
    }
  }
}