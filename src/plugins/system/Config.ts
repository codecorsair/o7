import { GenericConfig } from '@/src/shared/GenericConfig';
import { assert } from '@/src/shared/utils/assert';

const {
  PLUGIN_EVE_ECHOES_MONGO_CONNECTION_STRING,
  PLUGIN_EVE_ECHOES_MONGO_DATABASE
} = process.env;

export interface IConfig {
  mongo: {
    connectionString: string;
    database: string;
  };
}

const Config = new GenericConfig<IConfig>('eve_echoes.json');

export default {
  mongo: {
    connectionString: assert(
      'Mongo connection string not defined',
      Config.get('mongo.connectionString'),
      PLUGIN_EVE_ECHOES_MONGO_CONNECTION_STRING
    ),
    database: assert(
      'Mongo database not defined',
      Config.get('mongo.database'),
      PLUGIN_EVE_ECHOES_MONGO_DATABASE
    )
  }
} as IConfig;
