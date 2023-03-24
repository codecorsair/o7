import {
  Client as DJSClient,
  ClientOptions,
  Collection
} from 'discord.js';
import { ICommand } from '@/shared/interfaces/ICommand';
import { ICronjob } from '@/shared/interfaces/ICronjob';
import { IClient } from '@/shared/interfaces/IClient';
import { PluginManager } from './pluginManager/PluginManager';
import { IPluginWrapper } from './pluginManager/IPluginWrapper';
import { createLogger } from '@/shared/utils/logger';
import { Shard } from 'discord-cross-hosting';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import * as fs from 'fs';
import Config from './Config';

const logger = createLogger();

export class Client extends DJSClient implements IClient {
  private pluginManager: PluginManager;

  public cluster: any;
  public machine: any;
  public rest: any;

  public commands: Collection<string, ICommand> = new Collection();
  public cronjobs: Collection<string, ICronjob> = new Collection();

  constructor(options?: ClientOptions) {
    super(
      options || {
        intents: Config.intents
      }
    );

    this.on('ready', this.onReady.bind(this));
    this.on('interactionCreate', this.onInteractionCreate.bind(this));
    this.on('guildCreate', this.onGuildCreate.bind(this));

    this.cluster = new ClusterClient(client);
    this.machine = new Shard(client.cluster); // Initialize Cluster

    this.pluginManager = new PluginManager(this);

    this.loadPlugins();

    this.initCommands();
    this.initCronjobs();
  }

  onReady() {
    console.log(`Logged in as ${client.user?.tag}!`);
    client.machine
      .broadcastEval(`this.guilds.cache.size`)
      .then((results) => {
        console.log(
          `Total Guilds: ${results.reduce((prev, val) => prev + val, 0)}`
        );
      })
      .catch((e: any) =>
        console.error(`Error while fetching guild count: ${e}`)
      );
  }

  async onGuildCreate(guild) {
    const guildCount = await client?.shard?.fetchClientValues(
      'guilds.cache.size'
    );
    console.log(
      `Joined guild ${guild.name} (${guild.id}) [Total: ${guildCount}]`
    );
  }

  async onInteractionCreate(interaction) {
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
  }

  private loadPlugins(): void {
    if (!fs.existsSync(Config.pluginsPath)) {
      logger.error('Plugins folder does not exist');
      return;
    }

    const plugins = fs
      .readdirSync(Config.pluginsPath)
      .filter((file) => fs.existsSync(Config.pluginsPath + file + '/index.js'));

    for (const plugin of plugins) {
      const pluginWrapper: IPluginWrapper = {
        name: plugin,
        packageName: plugin,
        isRelative: true
      };

      logger.info(`Loading plugin ${plugin}`);
      this.pluginManager.registerPlugin(pluginWrapper);
      this.pluginManager.loadPlugin(plugin);
    }
  }

  public registerCommand(command: ICommand): void {
    command?.aliases.forEach((a) => {
      const alias = a.toLowerCase();
      if (this.commands.has(alias) && !command?.disabled) {
        logger.error(`Command with alias ${alias} already exists, skipping...`);
        return;
      }
      logger.info(`Registered command ${alias}`);
      this.commands.set(alias, command);
    });
  }

  public registerCronjob(cronjob: ICronjob): void {
    this.cronjobs.set(cronjob.name, cronjob);
  }

  private initCommands(): void {
    for (const [commandName, command] of this.commands.entries()) {
      this.application?.commands.create(command.commandBuilder(commandName));
      console.log(`Registered command ${commandName}`);
    }
  }

  private initCronjobs(): void {
    // for (const [cronjobName, cronjob] of this.cronjobs.entries()) {
    //     // cronjob.job.start()
    //     console.log(`Registered cronjob ${cronjobName}`)
    // }
  }
}
