import { existsSync } from "fs";
import { join } from "path";

let config: {
  dev: boolean;
  owners: string[];
  token: string;
  prefix: string;
  mongo: {
    connectionString: string;
    database: string;
  };
  neo4j: {
    uri: string;
    database: string;
    username: string;
    password: string;
  };
  gcloud: {
    auth: {
      client_email: string;
      private_key: string;
    };
    bucket: string;
  };
} = {} as any;

if (existsSync(join(__dirname, '../config.json'))) {
  console.log(`Config found at '${join(__dirname, '../config.json')}'`);
  config = require(join(__dirname, '../config.json'));
} else {
  console.log(`No config found at '${join(__dirname, '../config.json')}'`);
}

export default {
  dev: assert<boolean>("Config variable DEV is not set", process.env.NODE_ENV, config?.dev),
  owners: assert<string[]>("Config variable OWNERS is not set", process.env.OWNERS, config?.owners, 'none'),
  token: assert<string>("Config variable TOKEN is not set", process.env.TOKEN, config?.token),
  prefix: assert<string>("Config variable PREFIX is not set", process.env.PREFIX, config?.prefix, '!'),
  mongo: {
    connectionString: assert<string>("Config variable MONGO_CONNECTION_STRING is not set", process.env.MONGO_CONNECTION_STRING, config?.mongo?.connectionString),
    "database": assert<string>("Config variable MONGO_DATABASE is not set", process.env.MONGO_DATABASE, config?.mongo?.database),
  },
  neo4j: {
    uri: assert<string>("Config variable NEO4J_URI is not set", process.env.NEO4J_URI, config?.neo4j?.uri),
    database: assert<string>("Config variable NEO4J_DATABASE is not set", process.env.NEO4J_DATABASE, config?.neo4j?.database),
    username: assert<string>("Config variable NEO4J_USERNAME is not set", process.env.NEO4J_USERNAME, config?.neo4j?.username),
    password: assert<string>("Config variable NEO4J_PASSWORD is not set", process.env.NEO4J_PASSWORD, config?.neo4j?.password),
  },
  gcloud: {
    auth: {
      client_email: process.env.GCLOUD_AUTH_CLIENT_EMAIL || config?.gcloud?.auth?.client_email,
      private_key: process.env.GCLOUD_AUTH_PRIVATE_KEY || config?.gcloud?.auth?.private_key,
    },
    bucket: process.env.GCLOUD_BUCKET || config?.gcloud?.bucket,
  },
}

function assert<T>(msg: string, ...args: any[]): T {
  const arg: T|undefined = args.find(arg => arg !== undefined && arg !== null && arg !== '')
  if (arg) {
    return arg;
  }

  throw new Error(msg);
}