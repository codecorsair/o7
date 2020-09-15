import {
  MongoClient,
  FilterQuery,
  FindOneOptions,
  Cursor,
  OptionalId,
  CollectionInsertOneOptions,
  InsertOneWriteOpResult,
  WithId,
  CollectionInsertManyOptions,
  InsertWriteOpResult,
  UpdateQuery,
  UpdateWriteOpResult,
  UpdateOneOptions,
  UpdateManyOptions,
  ReplaceOneOptions,
  ReplaceWriteOpResult,
  CommonOptions,
  DeleteWriteOpResultObject,
} from 'mongodb';
import config from './config.json';



async function connect() {
  const client = new MongoClient(config.mongo.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
}

const db = { 
  collection: (name: string) => {
    return {
      // https://docs.mongodb.com/drivers/node/usage-examples/findOne
      findOne: async <T>(query: FilterQuery<T>, options?: FindOneOptions<T extends any ? T : T>): Promise<T | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).findOne(query, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/find
      find: async <T>(query: FilterQuery<T>): Promise<Cursor<T> | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).find(query);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/insertOne
      insertOne: async <T>(docs: OptionalId<T>, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<WithId<T>> | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).insertOne(docs, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/insertMany
      insertMany: async <T>(docs: Array<OptionalId<T>>, options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult<WithId<T>> | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).insertMany(docs, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/updateOne
      upsert: async <T>(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>): Promise<UpdateWriteOpResult | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).updateOne(filter, update, { upsert: true });
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/updateOne
      updateOne: async <T>(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>, options?: UpdateOneOptions,): Promise<UpdateWriteOpResult | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).updateOne(filter, update, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/updateMany
      updateMany: async <T>(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).updateMany(filter, update, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/replaceOne
      replaceOne: async <T>(filter: FilterQuery<T>, doc: T, options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).replaceOne(filter, doc, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/deleteOne
      deleteOne: async <T>(filter: FilterQuery<T>, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<DeleteWriteOpResultObject | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).deleteOne(filter, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
      // https://docs.mongodb.com/drivers/node/usage-examples/deleteMany
      deleteMany: async <T>(filter: FilterQuery<T>, options?: CommonOptions): Promise<DeleteWriteOpResultObject | null> => {
        let client;
        try {
          client = await connect();
          return await client.db(config.mongo.database).collection(name).deleteMany(filter, options);
        } catch (err) {
          console.error(err);
        } finally {
          if (client) {
            await client.close();
          }
        }
        return null;
      },
    }
  }
}

export {
  db,
}