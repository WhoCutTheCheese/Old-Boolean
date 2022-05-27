import { Client, Message, MessageEmbed, Permissions } from "discord.js"
const Guild = require('../../models/guild');
const Cases = require('../../models/cases');
const Config = require('../../models/config');
const ModLog = require('../../functions/modlogs');

const ms = require('ms')
module.exports = {
    commands: ['mute', 'm', 'silence'],
    minArgs: 1,
    cooldown: 3,
    expectedArgs: "[@User/User ID] (Time || Reason) {Reason}",
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS) || !message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
            return message.channel.send({ content: "I don't have permission to mute! Run **!!check** to finish setting me up!" })
        }
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        let muteUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!muteUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
        if (muteUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }
        if (muteUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
        if (muteUser.user.bot) { return message.channel.send({ content: "You cannot issue punishments to bots." }) }
        if (!/^\d/.test(args[1])) {
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            const config = await Config.findOne({
                guildID: message.guild?.id,
            })
            if (!config) { return message.channel.send({ content: "An unknown error occurred, contact support if this persists." }) }
            if (config.muteRoleID === "None") { return message.channel.send({ content: "You do not have a mute role!" }) }
            const muteRole = message.guild?.roles.cache.get(config.muteRoleID)
            if (!muteRole) { return message.channel.send({ content: "Your mute role does not exist or has been deleted." }) }
            const caseNumberSet = guildSettings.totalCases + 1;
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: muteUser.id,
                modID: message.author.id,
                caseType: "Mute",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "Permanent",
                date: Date.now(),
            })
            newCases.save().catch((err: any) => console.log(err))
            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                totalCases: caseNumberSet,
            })
            const warns = await Cases.countDocuments({
                guildID: message.guild?.id,
                userID: muteUser.id,
                caseType: "Warn",
            })
            muteUser.roles.add(muteRole).catch((err: any) => console.error(err));
            const muteEmbed = new MessageEmbed()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                .setColor(guildSettings.color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
            ModLog(true, caseNumberSet, message.guild?.id, "Mute", message.author.id, message, client, Date.now())


        } else if (/^\d/.test(args[1])) {
            if (args[1].endsWith("s")) {
                let time = args[1].replace("s", "");
                if (Number.isNaN(time)) { return message.channel.send({ content: "That is an invalid time!" }) }
                if(time.length > 6) { return message.channel.send({ content: "Invalid time format." }) }
                let reason = args.slice(2).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }    
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    modID: message.author.id,
                    caseType: "Mute",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: `${time} second(s)`,
                    date: Date.now(),
                })
                newCases.save().catch((err: any) => console.log(err))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    caseType: "Warn",
                })
                const muteEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** ${time} second(s) | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                muteUser.timeout(ms(`${time}s`), reason).catch((err: any) => console.error(err))
                ModLog(true, caseNumberSet, message.guild?.id, "Mute", message.author.id, message, client, Date.now())
            } else if (args[1].endsWith("m")) {
                let time = args[1].replace("m", "");
                if (Number.isNaN(time)) { return message.channel.send({ content: "That is an invalid time!" }) }
                if(time.length > 6) { return message.channel.send({ content: "Invalid time format." }) }
                let reason = args.slice(2).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }    
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    modID: message.author.id,
                    caseType: "Mute",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: `${time} minute(s)`,
                    date: Date.now(),
                })
                newCases.save().catch((err: any) => console.log(err))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    caseType: "Warn",
                })
                const muteEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** ${time} minutes(s) | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                muteUser.timeout(ms(`${time}m`), reason).catch((err: any) => console.error(err))
                ModLog(true, caseNumberSet, message.guild?.id, "Mute", message.author.id, message, client, Date.now())
            } else if (args[1].endsWith("h")) {
                let time = args[1].replace("h", "");
                if (Number.isNaN(time)) { return message.channel.send({ content: "That is an invalid time!" }) }
                if(time.length > 6) { return message.channel.send({ content: "Invalid time format." }) }
                let reason = args.slice(2).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }    
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    modID: message.author.id,
                    caseType: "Mute",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: `${time} hour(s)`,
                    date: Date.now(),
                })
                newCases.save().catch((err: any) => console.log(err))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    caseType: "Warn",
                })
                const muteEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** ${time} hour(s) | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                muteUser.timeout(ms(`${time}h`), reason)
                ModLog(true, caseNumberSet, message.guild?.id, "Mute", message.author.id, message, client, Date.now())
            } else if (args[1].endsWith("d")) {
                let time = args[1].replace("d", "");
                if (Number.isNaN(time)) { return message.channel.send({ content: "That is an invalid time!" }) }
                if(parseInt(time) > 27) { return message.channel.send({ content: "Time exceeds max timeout time! (27 days)" }) }
                if(time.length > 6) { return message.channel.send({ content: "Invalid time format." }) }
                let reason = args.slice(2).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }    
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    modID: message.author.id,
                    caseType: "Mute",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: `${time} day(s)`,
                    date: Date.now(),
                })
                newCases.save().catch((err: any) => console.log(err))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                    userID: muteUser.id,
                    caseType: "Warn",
                })
                const muteEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** ${time} day(s) | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                muteUser.timeout(ms(`${time}d`), reason).catch((err: any) => console.error(err))
                ModLog(true, caseNumberSet, message.guild?.id, "Mute", message.author.id, message, client, Date.now())
            }

        }
    },
}