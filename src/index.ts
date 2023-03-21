import { ShardingManager } from "discord.js";
import { config } from "./config";

const manager = new ShardingManager("./bot.js", { token: config.token });
manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn();
