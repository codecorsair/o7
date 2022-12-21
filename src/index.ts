import { client } from './client';
import config from './config';

client.loadCommands(__dirname + '/commands')
  .then(() => client.loadModules(__dirname + '/modules'));
client.owners = config.owners;
client.login(config.token);
