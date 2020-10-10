import { client } from './client';
import config from './config.json';

client.loadCommands(__dirname + '/commands');
client.owners = config.owners;
client.login(config.token);
