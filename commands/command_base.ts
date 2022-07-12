import { Client, Message, Permissions } from 'discord.js';
import mongoose from 'mongoose';
import GuildSchema from "../models/guild";
import ConfigSchema from "../models/config";
import ErrorLog from "../functions/errorlog";
const validatePermissions = (userPermissions: any) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
        'MODERATE_MEMBERS',
    ]

    for (const permission of userPermissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}"`)
        }
    }
}

const allCommands = {} as {
    [key: string]: any
}

module.exports = (commandOptions: { commands: any; userPermissions?: never[] | undefined; }) => {
    let {
        commands,
        userPermissions = [],
    } = commandOptions
    if (typeof commands === 'string') {
        commands = [commands]
    }
    if (userPermissions.length) {
        if (typeof userPermissions === 'string') {
            userPermissions = [userPermissions]
        }

        validatePermissions(userPermissions)
    }
    for (const command of commands) {
        allCommands[command] = {
            ...commandOptions,
            commands,
            userPermissions,
        }
    }
}
const bot = require('../package.json')
const talkedRecently = new Set();
module.exports.listen = (client: any) => {
    client.on('messageCreate', async (message: Message) => {
        try {
            if(!message.guild?.me?.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) { return; }
            if(!message.guild?.me?.permissions.has(Permissions.FLAGS.EMBED_LINKS)) { return; }
            const { member, content, guild } = message
            const serverSettings = await GuildSchema.findOne({
                guildID: message.guild?.id
            })
            const configFiles = await ConfigSchema.findOne({
                guildID: message.guild?.id
            })
            if(!serverSettings) { return message.reply("Please wait, I wasn't able to make a file when I joined!") }
            if(!configFiles) { return message.reply("Uh Oh! The config file has problems!") }
            let prefix
            if (!serverSettings) {
                prefix = "!!"
            } else {
                prefix = serverSettings.prefix
            }
            // Split on any number of spaces
            const args = content.split(/[ ]+/)

            // Remove the command which is the first index
            const name = args.shift()!.toLowerCase();
            if (name.startsWith(prefix)) {
                const command = allCommands[name.replace(prefix, '')]
                if (!command) {
                    return
                }
                let {
                    userPermissions,
                    permissionError = 'You do not have permission to execute this command.',
                    requiredRoles = [],
                    minArgs = 0,
                    maxArgs = null,
                    expectedArgs = [],
                    cooldown = 0,
                    devOnly = false,
                    staffPart = "Everyone",
                    callback,
                } = command
                // A command has been ran
                if (devOnly === true) {
                    const devs = ["648598769449041946", "493453098199547905"]
                    if (!devs.includes(message.author.id)) {
                        return message.channel.send({ content: "This command is currently disabled! Join our support server for more information." }).catch((err: Error) => ErrorLog(message.guild!, "DEV_ONLY_MESSAGE", err, client, message, `${message.author.id}`, `command_base.ts`))
                    }
                }


                // Ensure the user has the required permissions
                let hasPermission
                for (const _permission of userPermissions) {
                    if (!member?.permissions.has(userPermissions)) {
                        hasPermission = false
                    }
                }
                // Ensure the user has the required roles
                let hasRoles
                if (hasPermission === false) {
                    if (staffPart === "Mod") {
                        if (configFiles.modRoleID.length != 0) {
                            requiredRoles = configFiles.modRoleID
                        } else {
                            return message.reply({ content: permissionError })
                        }
                    } else if (staffPart === "Admin") {
                        if (configFiles.adminRoleID.length != 0) {
                            requiredRoles = configFiles.adminRoleID
                        } else {
                            return message.reply({ content: permissionError })
                        }
                    }
                    for (const requiredRole of requiredRoles) {
                        const role = guild?.roles.cache.get(requiredRole);
                        if (!member?.roles.cache.has(requiredRole)) {
                           hasRoles = false
                        } else {
                            hasRoles = true
                            break;
                        }
                    }
                    if(hasRoles == false) {
                        return message.reply({ content: permissionError });
                    }
                }
                // Ensure we have the correct number of args
                if (
                    args.length < minArgs ||
                    (maxArgs !== null && args.length > maxArgs)
                ) {
                    message.reply({
                        content: `Incorrect syntax! Use ${name} ${expectedArgs}`
                    }).catch((err: any) => ErrorLog(message.guild!, "ARGS_MESSAGE", err, client, message, `${message.author.id}`, `command_base.ts`));
                    return
                }

                if (talkedRecently.has(message.author.id)) {
                    return message.channel.send({ content: `You must wait ${cooldown} second(s) before using this again!` }).catch((err: Error) => ErrorLog(message.guild!, "COOLDOWN_MESSAGE", err, client, message, `${message.author.id}`, `command_base.ts`));
                } else {
                    talkedRecently.add(message.author.id);
                    setTimeout(() => {
                        // Removes the user from the set after a minute
                        talkedRecently.delete(message.author.id);
                    }, cooldown * 1000);
                }

                // Handle the custom command code
                talkedRecently.clear()
                callback(client, bot, message, args, args.join(' '), client).catch((err: Error) => ErrorLog(message.guild!, "COMMAND_CALLBACK", err, client, message, `${message.author.id}`, `command_base.ts`));
            }
        } catch (err) {
            ErrorLog(message.guild!, "MESSAGE_EVENT", err, client, message, `${message.author.id}`, `command_base.ts`)
        }
    });
}