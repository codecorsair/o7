import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
// import { extractText } from '../lib/tesseract';
// import Fuse from 'fuse.js';
import vision from '@google-cloud/vision';
import config from '../config.json';


// Creates a client


/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const bucketName = 'Bucket where the file resides, e.g. my-bucket';
// const fileName = 'Path to file within bucket, e.g. path/to/image.png';

// Performs text detection on the gcs file


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
    const fileName = 'testname.png';
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(`gs://${config.gcloud.bucket}/${fileName}`);
    const detections = result.textAnnotations;
    if (!detections) {
      console.log(`no text detections`)
      return;
    }
    console.log('Text:');
    detections.forEach(text => console.log(text));
    message.reply(detections.join('\n'))
    
//     const fuse = new Fuse([args.name], {
//       includeScore: true,
//       threshold: 0.3,
//     });

//     const searchResult = fuse.search(text);

//     if (searchResult.length == 0) {
//       message.reply(`Match failed with no results for ${text}`);
//       return;
//     }
//     return message.reply(`Matched ${text} with ${args.name} with a score of ${searchResult[0].score}`);
  }
}