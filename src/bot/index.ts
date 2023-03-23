import { Shard } from 'discord-cross-hosting'
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { Client } from './Client'
import Config from './Config'

const client = new Client({
    intents: ['Guilds'], // Your Intents
    shards: getInfo().SHARD_LIST, // An Array of Shard list, which will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // The Number of Total Shards
})

client.cluster = new ClusterClient(client)

client.machine = new Shard(client.cluster) // Initialize Cluster

client.on('ready', () => {
    client.machine
        .broadcastEval(`this.guilds.cache.size`)
        .then((results) => {
            console.log(results)
        })
        .catch((e) => console.log(e)) // broadcastEval() over all cross-hosted clients
})

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('guildCreate', async (guild) => {
    const guildCount = await client?.shard?.fetchClientValues(
        'guilds.cache.size',
    )
    console.log(
        `Joined guild ${guild.name} (${guild.id}) [Total: ${guildCount}]`,
    )
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
        return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
        if (interaction.isChatInputCommand()) {
            console.log(
                `Command ${interaction.commandName} used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`,
            )
            return await command.commandInteraction(interaction)
        } else if (interaction.isAutocomplete() && command.commandAutocomplete) {
            console.log(
                `Autocomplete ${interaction.commandName} used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`,
            )
            return await command.commandAutocomplete(interaction)
        }
    } catch (error) {
        console.error(
            `Error while executing command ${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} (${interaction.guild?.id})`,
            error,
        )
    }
})

client.login(Config.token)
