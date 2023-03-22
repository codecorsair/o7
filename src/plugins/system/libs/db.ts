import { MongoClient, Db } from 'mongodb';
import Config from '../Config';

// keep these here to maintain a single list of collections
export const collections = {
  settings: 'guildsettings',
  appconfig: 'appconfig',
  verification: 'verification',
  autovoiceconfig: 'autovoiceconfig',
  autovoicecreatedchannels: 'autovoicecreatedchannels',
}

// Usage guides:
// https://docs.mongodb.com/drivers/node/usage-examples/findOne
// https://docs.mongodb.com/drivers/node/usage-examples/find
// https://docs.mongodb.com/drivers/node/usage-examples/insertOne
// https://docs.mongodb.com/drivers/node/usage-examples/insertMany
// https://docs.mongodb.com/drivers/node/usage-examples/updateOne
// https://docs.mongodb.com/drivers/node/usage-examples/updateMany
// https://docs.mongodb.com/drivers/node/usage-examples/replaceOne
// https://docs.mongodb.com/drivers/node/usage-examples/deleteOne
// https://docs.mongodb.com/drivers/node/usage-examples/deleteMany
export function getClient(): MongoClient & { getDb: () => Db; } {
  const client = <any>new MongoClient(Config.mongo.connectionString);
  client.getDb = () => client.db(Config.mongo.database);
  return client;
}
