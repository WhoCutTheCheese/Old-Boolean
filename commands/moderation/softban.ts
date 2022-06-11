import { Client, Message, MessageEmbed, UserResolvable, Permissions } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
module.exports = {
    commands: ['softban', 'sb'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason || Days) {Reason}",
    cooldown: 2,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return message.channel.send({ content: "I don't have permission to edit slowmode! Run **!!check** to finish setting me up!" })
        }
        let banUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!banUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
        if (banUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        const warns = await Cases.countDocuments({
            guildID: message.guild?.id,
            userID: banUser.id,
            caseType: "Warn",
        })
        if (Number.isNaN(parseInt(args[1]))) {
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            const caseNumberSet = guildSettings.totalCases + 1;
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: banUser.id,
                modID: message.author.id,
                caseType: "Soft-Ban",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "None",
                date: Date.now(),
            })
            newCases.save().catch()
            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                totalCases: caseNumberSet,
            })
            if (banUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }
            const warnEmbed = new MessageEmbed()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(guildSettings.color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
            banUser.ban({ reason: reason, days: 7 }).catch((err: any) => console.log(err)).then(() => message.guild?.members.unban(banUser?.id as UserResolvable))
            ModLog(true, caseNumberSet, message.guild?.id, "Soft-Ban", message.author.id, message, client, Date.now())

        } else if (!Number.isNaN(args[1])) {
            let reason = args.slice(2).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            const caseNumberSet = guildSettings.totalCases + 1;
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: banUser.id,
                modID: message.author.id,
                caseType: "Soft-Ban",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "None",
                date: Date.now(),
            })
            newCases.save().catch()
            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                totalCases: caseNumberSet,
            })
            if (banUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }
            const warnEmbed = new MessageEmbed()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(guildSettings.color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
            banUser.ban({ reason: reason, days: parseInt(args[1]) }).catch((err: any) => console.log(err)).then(() => message.guild?.members.unban(banUser?.id as UserResolvable))
            ModLog(true, caseNumberSet, message.guild?.id, "Soft-Ban", message.author.id, message, client, Date.now())

        }

    },
}