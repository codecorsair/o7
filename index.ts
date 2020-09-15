import { o7Client } from './client';
import config from './config.json';

const client = new o7Client();
client.login(config.token);