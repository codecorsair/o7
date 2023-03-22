import {
    Client as DJSClient,
    ClientOptions,
    Collection,
    GatewayIntentBits,
} from 'discord.js'
import { ICommand } from '../shared/interfaces/ICommand'
import { ICronjob } from '../shared/interfaces/ICronjob'
import { IClient } from '../shared/interfaces/IClient'
import { PluginManager } from './pluginManager/PluginManager'
import { IPluginWrapper } from './pluginManager/IPluginWrapper'
import * as fs from 'fs'

export class Client extends DJSClient implements IClient {
    private pluginManager: PluginManager;

    public cluster: any
    public machine: any

    public commands: Collection<string, ICommand> = new Collection()
    public cronjobs: Collection<string, ICronjob> = new Collection()

    constructor(options?: ClientOptions) {
        super(
            options || {
                intents: [
                    GatewayIntentBits.Guilds,
                    // GatewayIntentBits.GuildMembers,
                    // GatewayIntentBits.GuildBans,
                    // GatewayIntentBits.GuildEmojisAndStickers,
                    // GatewayIntentBits.GuildIntegrations,
                    // GatewayIntentBits.GuildWebhooks,
                    // GatewayIntentBits.GuildInvites,
                    // GatewayIntentBits.GuildVoiceStates,
                    // GatewayIntentBits.GuildPresences,
                    // GatewayIntentBits.GuildMessages,
                    // GatewayIntentBits.GuildMessageReactions,
                    // GatewayIntentBits.GuildMessageTyping,
                    // GatewayIntentBits.DirectMessages,
                    // GatewayIntentBits.DirectMessageReactions,
                    // GatewayIntentBits.DirectMessageTyping,
                    // GatewayIntentBits.MessageContent,
                    // GatewayIntentBits.GuildScheduledEvents,
                    // GatewayIntentBits.AutoModerationConfiguration,
                    // GatewayIntentBits.AutoModerationExecution
                ],
            },
        )

        this.pluginManager = new PluginManager(this)

        this.loadPlugins()

        this.initCommands()
        this.initCronjobs()
    }

    private loadPlugins(): void {
        if (!fs.existsSync(__dirname + '/plugins')) {
            throw new Error(
                `Plugins path ${__dirname + '/plugins'} does not exist`,
            )
        }

        const plugins = fs
            .readdirSync(__dirname + '/plugins')
            .filter((file) =>
                fs.existsSync(__dirname + '/plugins/' + file + '/index.js'),
            )

        for (const plugin of plugins) {
            const pluginWrapper: IPluginWrapper = {
                name: plugin,
                packageName: plugin,
                isRelative: true,
            }

            this.pluginManager.registerPlugin(pluginWrapper)
            this.pluginManager.loadPlugin(plugin)
        }
    }

    public registerCommand(command: ICommand): void {
        command?.aliases.forEach((a) => {
            const alias = a.toLowerCase()
            if (this.commands.has(alias) && !command?.disabled) {
                console.error(
                    `Error loading command. ${command.aliases[0]} contains duplicate alias '${alias}'.`,
                )
                return
            }
            this.commands.set(alias, command)
        })
    }

    public registerCronjob(cronjob: ICronjob): void {
        this.cronjobs.set(cronjob.name, cronjob)
    }

    private initCommands(): void {
        for (const [commandName, command] of this.commands.entries()) {
            this.application?.commands.create(command.commandBuilder(commandName))
            console.log(`Registered command ${commandName}`)
        }
    }

    private initCronjobs(): void {
        // for (const [cronjobName, cronjob] of this.cronjobs.entries()) {
        //     // cronjob.job.start()
        //     console.log(`Registered cronjob ${cronjobName}`)
        // }
    }
}
