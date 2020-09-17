import { Listener } from 'discord-akairo';
import { cacheAllItems } from '../lib/market-api';

export default class ReadyListener extends Listener {
  constructor() {
    super('ready', {
        emitter: 'client',
        event: 'ready'
    });
  }

  async exec() {
    const start = new Date();
    console.log('Caching market items...')
    await cacheAllItems();
    console.log(`I\'m ready! Init time ${new Date().getTime() - start.getTime()}ms`);
  }
}
