import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js"
import Settings from "../models/settings";
let prefix: string | undefined
import Permits from "../models/permits";
import Maintenance from "../models/maintenance";

const allCommands = {} as {
    [key: string]: any
}

const validateCommands = (command: string) => {
    const validCommands = [
        "AUTOMOD",
        "AUTOMUTE",
        "CHECK",
        "COLOR",
        "CONFIG",
        "DM",
        "JOINROLE",
        "MODLOGS",
        "MUTEROLE",
        "PERMIT",
        "BAN",
        "CASE",
        "DELCASE",
        "HISTORY",
        "KICK",
        "LOCK",
        "MUTE",
        "NICKNAME",
        "PURGE",
        "UNBAN",
        "UNLOCK",
        "UNMUTE",
        "WARN",
        "REASON",
        "DELETEUSAGE",
        "PREFIX",
        "CONFIGURATION",
        "MODERATION",
    ]

    if (!validCommands.includes(command)) {
        throw new Error("Unknown command/category!")
    }

}

module.exports = (commandOptions: { commands: string[] }) => {
    let {
        commands,
    } = commandOptions
    if (typeof commands === 'string') {
        commands = [commands]
    }
    for (const command of commands) {
        allCommands[command] = {
            ...commandOptions,
            commands,
        }
    }
}
let set = new Set()
module.exports.listen = (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
        try {
            if (!message.inGuild) return;
            if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
            if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;

            const settings = await Settings.findOne({
                guildID: message.guild?.id
            })
            if (!settings) { message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" }); return; }

            let color: ColorResolvable = "5865F2" as ColorResolvable;
            if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;


            const permits = await Permits.find({
                guildID: message.guild.id
            })

            prefix = settings.guildSettings?.prefix;
            if (!prefix) prefix = "!!";

            const args = message.content.split(/[ ]+/)
            const name = args.shift()!.toLowerCase();

            if (name.startsWith(prefix)) {
                const devs = ["493453098199547905", "648598769449041946", "585731185083285504"]
                const maintenance = await Maintenance.findOne({
                    botID: client.user?.id
                })
                if (maintenance) {
                    if (maintenance.maintenance == true) {
                        if (!devs.includes(message.author.id)) {
                            message.channel.send({ content: `**Uh Oh!** Boolean is currently under maintenance!\n**__Details:__** ${maintenance.maintainDetails}` })
                            return;
                        }
                    }
                }
                const command = allCommands[name.replace(prefix, '')]
                if (!command) {
                    return
                }
                let {
                    minArgs = 0,
                    maxArgs = null,
                    expectedArgs = "",
                    cooldown = 0,
                    devOnly = false,
                    commandName = null,
                    commandCategory = null,
                    callback,
                } = command

                if (devOnly == true) {
                    if (!devs.includes(message.author.id)) {
                        message.channel.send({ content: "This command is for developers only." })
                        return
                    }
                }

                if (commandName && commandCategory) {


                    let hasPermit: boolean = false
                    const roles = message.member?.roles.cache.map(role => role);
                    let hasRole: boolean = false
                    let ObjectID: any
                    validateCommands(commandName)
                    validateCommands(commandCategory)
                    for (const role of roles!) {
                        for (const permit of permits) {
                            if (permit.roles.includes(role.id)) {
                                hasRole = true
                                ObjectID = permit._id
                                break;
                            } else {
                                hasRole = false
                            }
                        }
                        if (hasRole == true) break;
                    }

                    for (const permit of permits) {
                        if (permit.users.includes(message.author.id)) {
                            ObjectID = permit._id;
                            break;
                        }
                    }

                    const thePermit = await Permits.findOne({
                        _id: ObjectID
                    })
                    if (thePermit?.commandAccess.includes(commandName) || thePermit?.commandAccess.includes(commandCategory)) hasPermit = true;
                    if (thePermit?.commandBlocked.includes(commandName) || thePermit?.commandBlocked.includes(commandCategory)) hasPermit = false;

                    if (message.guild.ownerId === message.author.id) hasPermit = true
                    if (hasPermit == false) {
                        message.channel.send({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!" })
                        return;
                    }
                }

                if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs)) {
                    message.reply({ content: `Incorrect syntax! Use \`${name} ${expectedArgs}\`` })
                    return;
                }

                if (cooldown > 0) {
                    if (set.has(message.author.id)) {
                        message.channel.send({ content: `You must wait \`${cooldown} second(s)\` before using this command again!` })
                        return;
                    } else {
                        set.add(message.author.id);
                        setTimeout(() => {
                            set.delete(message.author.id);
                        }, cooldown * 1000);
                    }
                }

                if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    if ((message.channel as TextChannel).permissionsFor(message.guild.members.me!)?.has(PermissionsBitField.Flags.ManageMessages)) {
                        if (settings.modSettings?.deleteCommandUsage == true) {
                            if (message.deletable) {
                                setTimeout(() => {
                                    message.delete
                                }, 3000)
                            }
                        }
                    }
                }

                callback(client, message, args, args.join(' '))

            }

        } catch (err) {
            if (message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
                message.channel.send({ content: "I encountered an error! Please try again. If this persists, join our support server!" })
                console.log(err)
                return;
            }
        }
    })
}