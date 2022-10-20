import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";
import Permits from "../../models/permits"
import GuildProperties from "../../models/guild";

module.exports = {
    commands: ['permit', 'permits'],
    commandName: "PERMIT",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    expectedArgs: "[view || create/delete/adduser/removeuser/addrole/removerole/addcommand/removecommand/blockcommand/unblockcommand/automodbypass/rename] [(Permit Name)] [(Value)]",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

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
                "CONFIGURATION",
                "MODERATION",
            ]

            if (!validCommands.includes(command)) {
                return true
            }

        }

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })
        const color = configuration?.embedColor as ColorResolvable;

        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id
        })

        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        if (args[1]) {
            if (/\s/.test(args[1])) return message.channel.send({ content: "You cannot have empty spaces in permit names! Ex. `HiImAPermit`" })
            if (!/^[a-z0-9]+$/i.test(args[1])) return message.channel.send({ content: "Permit name cannot have non-alphanumeric character!" })
        }

        switch (args[0].toLowerCase()) {

            case "view":

                let permitsArray: String[] = []
                const loopPermits = await Permits.find({
                    guildID: message.guild?.id
                })
                for (const permit of loopPermits) {
                    let roles: String[] = []
                    let users: String[] = []
                    let allowedCommands: String[] = []
                    let disallowedCommands: String[] = []
                    for (const role of permit.roles) {
                        roles.push(` <@&${role}>`)
                    }
                    for (const user of permit.users) {
                        users.push(` <@${user}>`)
                    }
                    for (const allowedCommand of permit.commandAccess) {
                        allowedCommands.push(` ${allowedCommand}`)
                    }
                    for (const notAllowedCommand of permit.commandBlocked) {
                        disallowedCommands.push(` ${notAllowedCommand}`)
                    }
                    if (roles.length == 0) roles.push("None")
                    if (users.length == 0) users.push("None")
                    if (allowedCommands.length == 0) allowedCommands.push("None")
                    if (disallowedCommands.length == 0) disallowedCommands.push("None")
                    permitsArray.push(`\n**${permit.permitName}**:
                    > **Added Roles:** ${roles}
                    > **Added Users:** ${users}
                    > **Allowed Commands:** ${allowedCommands}
                    > **Blocked Commands:** ${disallowedCommands}
                    > **Automod Bypass:** ${permit.autoModBypass}`)
                }
                if (permitsArray.length == 0) permitsArray.push(`\nThis guild has no permits!`)
                const listEmbed = new EmbedBuilder()
                    .setAuthor({ name: "Current Permits", iconURL: message.guild?.iconURL() || client.user?.displayAvatarURL() || undefined })
                    .setDescription(`Current permits, what commands they can use and who has access to them.
                    ${permitsArray}`)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [listEmbed] })

                break;
            case "create":

                const permitNumber = await Permits.countDocuments({
                    guildID: message.guild?.id
                })
                let maxPermits: number
                if (guildProp?.premium === false) {
                    maxPermits = 5
                } else {
                    maxPermits = 10
                }
                if (permitNumber > maxPermits) return message.channel.send({ content: `You have reached the maximum amount of permits. **(${maxPermits}/${maxPermits})**` })

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit create PermitName`" })

                const alreadyExists = await Permits.findOne({
                    permitName: args[1].toLowerCase(),
                    guildID: message.guild?.id
                })
                if (alreadyExists) return message.channel.send({ content: `A permit under the name \`${args[1].toLowerCase()}\` already exists. Run \`!!permit view\` to view a list of permits.` })

                const newPermit = new Permits({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                    roles: [],
                    users: [],
                    commandAccess: [],
                    commandBlocked: [],
                    autoModBypass: false,
                })
                newPermit.save()
                let description = `<:yes:979193272612298814> Successfully created permit named \`${args[1].toLowerCase()}\`! Run \`!!permit addcommand\` to add an allowed commmand to your permit!`

                const newPermitEmbed = new EmbedBuilder()
                    .setDescription(description)
                    .setTimestamp()
                    .setColor(color)
                message.channel.send({ embeds: [newPermitEmbed] })

                break;
            case "delete":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit delete PermitName`" })

                const exists = await Permits.findOne({
                    permitName: args[1].toLowerCase(),
                    guildID: message.guild?.id
                })
                if (!exists) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })

                await Permits.deleteOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase()
                })

                const deletedPermitEmbed = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Deleted permit \`${args[1].toLowerCase()}\`!`)
                    .setTimestamp()
                    .setColor(color)
                message.channel.send({ embeds: [deletedPermitEmbed] })

                break;
            case "adduser":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit adduser PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a role! Ex. `!!permit adduser PermitName @User`" })

                const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[2])
                if (!user) return message.channel.send({ content: "Invalid user! Ex. `!!permit adduser @User/User ID`" })

                const doesThisPermitExist = await Permits.findOne({
                    permitName: args[1].toLowerCase(),
                    guildID: message.guild?.id
                })
                if (!doesThisPermitExist) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (doesThisPermitExist.users.includes(user.id)) return message.channel.send({ content: `User <@${user.id}> is already in permit \`${args[1].toLowerCase()}\`!` })

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    $push: { users: user.id }
                })

                const permitAddUser = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully added \`@${user.user.tag}\` to \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [permitAddUser] })

                break;
            case "removeuser":
            case "deleteuser":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit removeuser PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a role! Ex. `!!permit removeuser PermitName @User`" })

                const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[2])
                if (!member) return message.channel.send({ content: "Invalid user! Ex. `!!permit removeuser @User/User ID`" })

                const doesThisPermitExists = await Permits.findOne({
                    permitName: args[1].toLowerCase(),
                    guildID: message.guild?.id
                })
                if (!doesThisPermitExists) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (!doesThisPermitExists.users.includes(member.id)) return message.channel.send({ content: `User <@${member.id}> is not in permit \`${args[1].toLowerCase()}\`!` })

                const users = doesThisPermitExists.users
                const usersIndex = users.indexOf(member.id)

                if (usersIndex > -1) {
                    users.splice(usersIndex, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    users: users
                })

                const permitRemoveUser = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Successfully removed \`@${member.user.tag}\` from \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [permitRemoveUser] })

                break;
            case "addrole":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit addrole PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a role! Ex. `!!permit addrole PermitName @Role`" })

                const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[2]);
                if (!role) return message.channel.send({ content: "Invalid role! Ex. `!!permit addrole @Role/Role ID`" })

                const doesPermitExistAddRole = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase()
                })
                if (!doesPermitExistAddRole) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (doesPermitExistAddRole.roles.includes(role.id)) return message.channel.send({ content: `Role <@&${role.id}> is already in permit \`${args[1].toLowerCase()}\`!` })

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),

                }, {
                    $push: { roles: role.id }
                })

                const permitAddRole = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully added \`@${role.name}\` to \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [permitAddRole] })


                break;
            case "removerole":
            case "deleterole":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit removerole PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a role! Ex. `!!permit removerole PermitName @Role`" })

                const roleRemove = message.mentions.roles.first() || message.guild?.roles.cache.get(args[2]);
                if (!roleRemove) return message.channel.send({ content: "Invalid role! Ex. `!!permit removerole @Role/Role ID`" })

                const doesPermitExistRemoveRole = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })
                if (!doesPermitExistRemoveRole) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (!doesPermitExistRemoveRole.roles.includes(roleRemove.id)) return message.channel.send({ content: `Role <@&${roleRemove.id}> is not in permit \`${args[1].toLowerCase()}\`!` })

                let roles = doesPermitExistRemoveRole.roles
                const rolesIndex = roles.indexOf(roleRemove.id)

                if (rolesIndex > -1) {
                    roles.splice(rolesIndex, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    roles: roles
                })
                const roleRemovedEmbed = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Successfully removed \`@${roleRemove.name}\` from \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [roleRemovedEmbed] })

                break;
            case "addcommand":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit addcommand PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a command! Ex. `!!permit addcommand PermitName BAN`" })
                if (args[2].toLowerCase() === "all") return message.channel.send({ content: "You cannot add all commands to a permit!" })

                const doesPermitExistAddCommand = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })
                if (!doesPermitExistAddCommand) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (doesPermitExistAddCommand.commandAccess.includes(args[2].toUpperCase())) return message.channel.send({ content: `\`${args[1].toLowerCase()}\` already has access to \`${args[2].toUpperCase()}\`` })

                if(validateCommands(args[2].toUpperCase())) return message.channel.send({ content: "Invalid command/category." })

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    $push: { commandAccess: args[2].toUpperCase() }
                })

                const commandAddPermit = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully added \`${args[2].toUpperCase()}\` to \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [commandAddPermit] })

                break;
            case "removecommand":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit removecommand PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a command! Ex. `!!permit removecommand PermitName BAN`" })

                const doesPermitExistRemoveCommand = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })
                if (!doesPermitExistRemoveCommand) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (!doesPermitExistRemoveCommand.commandAccess.includes(args[2].toUpperCase())) return message.channel.send({ content: `\`${args[1].toLowerCase()}\` already does not have access to \`${args[2].toUpperCase()}\`` })


                if (args[2].toLowerCase() === "all") {
                    await Permits.findOneAndUpdate({
                        guildID: message.guild?.id,
                        permitName: args[1].toLowerCase(),
                    }, {
                        commandAccess: []
                    })

                    const commandRemoveAll = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Successfully removed all commands from \`${args[1].toLowerCase()}\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [commandRemoveAll] })

                }
                if(validateCommands(args[2].toUpperCase())) return message.channel.send({ content: "Invalid command/category." })

                let commands = doesPermitExistRemoveCommand.commandAccess
                const commandsIndex = commands.indexOf(args[2].toUpperCase())
                if (commandsIndex > -1) {
                    commands = commands.splice(commandsIndex, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    commandAccess: commands
                })

                const commandRemovePermit = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Successfully removed \`${args[2].toUpperCase}\` from \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [commandRemovePermit] })


                break;
            case "blockcommand":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit blockcommand PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a command! Ex. `!!permit blockcommand PermitName BAN`" })
                if (args[2].toLowerCase() === "all") return message.channel.send({ content: "You cannot block all commands!" })

                const doesPermitExistBlockCommand = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })

                if (!doesPermitExistBlockCommand) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (doesPermitExistBlockCommand.commandBlocked.includes(args[2].toUpperCase())) return message.channel.send({ content: `\`${args[1].toLowerCase()}\` already has \`${args[2].toUpperCase()}\` blocked!` })

                if(validateCommands(args[2].toUpperCase())) return message.channel.send({ content: "Invalid command/category." })
                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    $push: { commandBlocked: args[2].toUpperCase() }
                })

                const commandBlockPermit = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully blocked \`${args[2].toUpperCase}\` from \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [commandBlockPermit] })

                break;
            case "unblockcommand":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit unblockcommand PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a command! Ex. `!!permit unblockcommand PermitName BAN`" })

                const doesPermitExistUnblockCommand = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })
                if (!doesPermitExistUnblockCommand) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                if (!doesPermitExistUnblockCommand.commandBlocked.includes(args[2].toUpperCase())) return message.channel.send({ content: `\`${args[1].toLowerCase()}\` does not have \`${args[2].toUpperCase()}\` blocked!` })

                if (args[2].toLowerCase() === "all") {
                    await Permits.findOneAndUpdate({
                        guildID: message.guild?.id,
                        permitName: args[1].toLowerCase(),
                    }, {
                        commandBlocked: []
                    })

                    const commandUnblockAll = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Successfully unblocked all commands from \`${args[1].toLowerCase()}\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [commandUnblockAll] })
                }

                if(validateCommands(args[2].toUpperCase())) return message.channel.send({ content: "Invalid command/category." })

                let commandsBlocked = doesPermitExistUnblockCommand.commandBlocked
                const commandsBlockedIndex = commandsBlocked.indexOf(args[2].toUpperCase())
                if (commandsBlockedIndex > -1) {
                    commandsBlocked = commandsBlocked.splice(commandsBlockedIndex, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    commandBlocked: commandsBlocked
                })

                const commandUnblockPermit = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Successfully unblocked \`${args[2].toUpperCase}\` from \`${args[1].toLowerCase()}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [commandUnblockPermit] })

                break;
            case "automodbypass":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit automodbypass PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a boolean! Ex. `!!permit automodbypass PermitName true/false`" })

                let boolean: boolean
                if(args[2].toLowerCase() === "true") {
                    boolean = true
                } else if(args[2].toLowerCase() === "false") {
                    boolean = false
                } else return message.channel.send({ content: "You must provide a boolean! Ex. `!!permit automodbypass PermitName true/false`" })

                const doesPermitExistAutoModBypass = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })
                if (!doesPermitExistAutoModBypass) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })
                
                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    autoModBypass: boolean
                })

                if(boolean == true) {
                    const autoModBypassTrue = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> \`${args[1].toLowerCase()}\` will now bypass automod!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [autoModBypassTrue] })
                } else if (boolean = false) {
                    const autoModBypassFalse = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> \`${args[1].toLowerCase()}\` will no longer bypass automod!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [autoModBypassFalse] })
                }

                break;
            case "rename":

                if (!args[1]) return message.channel.send({ content: "You are missing a permit name! `!!permit rename PermitName`" })
                if (!args[2]) return message.channel.send({ content: "You must provide a new name! Ex. `!!permit rename PermitName NewName`" })

                const doesPermitExistRename = await Permits.findOne({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                })

                if (!doesPermitExistRename) return message.channel.send({ content: `Permit \`${args[1].toLowerCase()}\` does not exist.` })

                await Permits.findOneAndUpdate({
                    guildID: message.guild?.id,
                    permitName: args[1].toLowerCase(),
                }, {
                    permitName: args[2].toLowerCase()
                })

                const permitRename = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully renamed \`${args[1].toLowerCase()}\` to \`${args[2]}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [permitRename] })

                break;

        }


    },
}