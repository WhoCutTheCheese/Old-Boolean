import { Client, Message, MessageEmbed, UserResolvable, Permissions, TextChannel } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
import Bans from "../../models/ban";
import Config from "../../models/config";
const ms = require("ms");
module.exports = {
    commands: ['ban', 'b'],
    minArgs: 1,
    expectedArgs: "[@User\|\| User ID] (Reason \|\| Days) {Reason}",
    cooldown: 2,
    staffPart: "Mod",
    userPermissions: ["BAN_MEMBERS"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                return message.channel.send({ content: "I don't have permission to ban members! Run **!!check** to finish setting me up!" })
            }
            let banUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
            if (!banUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
            if (banUser.roles.highest.position >= message.member!.roles.highest.position) { return message.channel.send({ content: "You cannot issue punishments to users above or equal to you." }) }
            if (banUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const configSettings = await Config.findOne({
                guildID: message.guild?.id,
            })
            const warns = await Cases.countDocuments({
                guildID: message.guild?.id,
                userID: banUser.id,
                caseType: "Warn",
            })
            if (!/^\d/.test(args[1])) {
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: banUser.id,
                    modID: message.author.id,
                    caseType: "Ban",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "Permanent",
                    date: Date.now(),
                })
                newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `softban.ts`))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                if (banUser.id === message.guild.ownerId) { return message.channel.send({ content: "Unable to issue punishments to this user!" }) }
                if (!banUser.bannable) { return message.channel.send({ content: "I am unable to ban this user!" }) }
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                if (configSettings.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You were banned from " + message.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Duration:** Permanent
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                        if (!channel) { return; }
                        return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                    })
                }
                banUser.ban({ reason: reason }).catch((err: Error) => ErrorLog(message.guild!, "BAN_FUNCTION", err, client, message, `${message.author.id}`, `ban.ts`))
                ModLog(true, caseNumberSet, message.guild?.id, "Ban", message.author.id, message, client, Date.now())
            } else if (/^\d/.test(args[1])) {
                if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {
                    let time1 = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "")
                    if (Number.isNaN(parseInt(time1))) {
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                        const caseNumberSet = guildSettings.totalCases + 1;
                        const newCases = await new Cases({
                            guildID: message.guild?.id,
                            userID: banUser.id,
                            modID: message.author.id,
                            caseType: "Ban",
                            caseReason: reason,
                            caseNumber: caseNumberSet,
                            caseLength: "Permanent",
                            date: Date.now(),
                        })
                        newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `softban.ts`))
                        await Guild.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            totalCases: caseNumberSet,
                        })
                        if (banUser.id === message.guild.ownerId) { return message.channel.send({ content: "Unable to issue punishments to this user!" }) }
                        if (!banUser.bannable) { return message.channel.send({ content: "I am unable to ban this user!" }) }
                        const warnEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                            .setColor(guildSettings.color)
                        message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                        if (configSettings.dmOnPunish == true) {
                            const youWereWarned = new MessageEmbed()
                                .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(guildSettings.color)
                                .setDescription("You were banned from " + message.guild?.name + ` 
                                
                                **__Details:__** ${reason}
                                > **Duration:** Permanent
                                > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                > **Case:** ${caseNumberSet}
                                > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                                if (!channel) { return; }
                                return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                            })
                        }
                        banUser.ban({ reason: reason }).catch((err: Error) => ErrorLog(message.guild!, "BAN_FUNCTION", err, client, message, `${message.author.id}`, `ban.ts`))
                        ModLog(true, caseNumberSet, message.guild?.id, "Ban", message.author.id, message, client, Date.now())
                        return;
                    }
                    let type: any
                    if (args[1].endsWith("s")) {
                        type = "s"
                    } else if (args[1].endsWith("m")) {
                        type = "m"
                    } else if (args[1].endsWith("h")) {
                        type = "h"
                    } else if (args[1].endsWith("d")) {
                        type = "d"
                    } else if (args[1].endsWith("w")) {
                        type = "w"
                    }
                    let time: number
                    if (type === "s") {
                        time = parseInt(time1);
                    } else if (type === "m") {
                        time = parseInt(time1) * 60
                    } else if (type === "h") {
                        time = parseInt(time1) * 60 * 60
                    } else if (type === "d") {
                        time = parseInt(time1) * 60 * 60 * 24
                    } else if (type === "w") {
                        time = parseInt(time1) * 60 * 60 * 24 * 7
                    }
                    let reason = args.slice(2).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                    const expires = new Date()
                    expires.setSeconds(expires.getSeconds() + time!)
                    const cock = await new Bans({
                        guildID: message.guild.id,
                        userID: banUser.id,
                        caseNumber: 0,
                        caseEndDate: expires,
                    })
                    cock.save().catch((err: Error) => console.log(err))
                    if (banUser.id === message.guild.ownerId) { return message.channel.send({ content: "Unable to issue punishments to this user!" }) }
                    if (!banUser.bannable) { return message.channel.send({ content: "I am unable to ban this user!" }) }
                    const caseNumberSet = guildSettings.totalCases + 1;
                    if (configSettings.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(guildSettings.color)
                            .setDescription("You were banned from " + message.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Duration:** ${time1 + type}
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                            if (!channel) { return; }
                            return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason })
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: banUser.id,
                        modID: message.author.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: time1 + type,
                        date: Date.now(),
                    })
                    newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `ban.ts`))
                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    const banEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(guildSettings.color)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been banned. **Duration:** ${time1 + type} (Warns **${warns}**)`, embeds: [banEmbed] })
                    ModLog(true, caseNumberSet, message.guild?.id, "Ban", message.author.id, message, client, Date.now())
                } else {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                    const caseNumberSet = guildSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: banUser.id,
                        modID: message.author.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: "Permanent",
                        date: Date.now(),
                    })
                    newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `ban.ts`))
                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    if (banUser.id === message.guild.ownerId) { return message.channel.send({ content: "Unable to issue punishments to this user!" }) }
                    if (!banUser.bannable) { return message.channel.send({ content: "I am unable to ban this user!" }) }
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(guildSettings.color)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                    if (configSettings.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(guildSettings.color)
                            .setDescription("You were banned from " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Duration:** Permanent
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                            if (!channel) { return; }
                            return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason }).catch((err: Error) => ErrorLog(message.guild!, "BAN_FUNCTION", err, client, message, `${message.author.id}`, `ban.ts`))
                    ModLog(true, caseNumberSet, message.guild?.id, "Ban", message.author.id, message, client, Date.now())
                }
            }
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "BAN_COMMAND", err, client, message, `${message.author.id}`, `ban.ts`)
            }
        }
        function endsWithAny(suffixes: any, string: any) {
            return suffixes.some(function (suffix: any) {
                return string.endsWith(suffix);
            });
        }

    },
}