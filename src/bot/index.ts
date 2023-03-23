import { Shard } from 'discord-cross-hosting';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { Client } from './Client';
import Config from './Config';

const client = new Client({
  intents: ['Guilds'], // Your Intents
  shards: getInfo().SHARD_LIST, // An Array of Shard list, which will get spawned
  shardCount: getInfo().TOTAL_SHARDS // The Number of Total Shards
});

client.cluster = new ClusterClient(client);
client.machine = new Shard(client.cluster); // Initialize Cluster
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.machine
    .broadcastEval(`this.guilds.cache.size`)
    .then((results) => {
      console.log(
        `Total Guilds: ${results.reduce((prev, val) => prev + val, 0)}`
      );
    })
    .catch((e: any) => console.error(`Error while fetching guild count: ${e}`));
});

client.on('guildCreate', async (guild) => {
  const guildCount = await client?.shard?.fetchClientValues(
    'guilds.cache.size'
  );
  console.log(
    `Joined guild ${guild.name} (${guild.id}) [Total: ${guildCount}]`
  );
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
    return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    if (interaction.isChatInputCommand()) {
      console.log(
        `Command ${interaction.commandName} used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`
      );
      await command.commandInteraction(interaction);
      return;
    } else if (interaction.isAutocomplete() && command.commandAutocomplete) {
      console.log(
        `Autocomplete ${interaction.commandName} used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`
      );
      await command.commandAutocomplete(interaction);
      return;
    }
  } catch (error) {
    console.error(
      `Error while executing command ${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`,
      error
    );
    if (interaction.isChatInputCommand()) {
      if (interaction.replied) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      }
    }
    return;
  }
});

client.cluster.on('clusterReady', () => {
  client
    .login(Config.token)
    .catch((e) => console.error(`Error while logging in: ${e}`))
    .then(() => {
      console.log('Logged in');
    });
});
