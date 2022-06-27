import { Client, Message, MessageEmbed, Permissions } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['kick', 'k'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    cooldown: 2,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) { return message.channel.send({ content: "I don't have permission to kick! Run **!!check** to finish setting me up!" }) }
            let kickUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
            if (!kickUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            if (kickUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const warns = await Cases.countDocuments({
                guildID: message.guild?.id,
                userID: kickUser.id,
                caseType: "Warn",
            })
            const caseNumberSet = guildSettings.totalCases + 1;
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: kickUser.id,
                modID: message.author.id,
                caseType: "Kick",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "None",
                date: Date.now(),
            })
            newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE", err, client, message, `${message.author.id}`, `kick.ts`))
            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                totalCases: caseNumberSet,
            })
            if (kickUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }
            if (kickUser.id === message.guild.ownerId) { return message.channel.send({ content: "Unable to issue punishments to this user!" }) }
            if (!kickUser.kickable) { return message.channel.send({ content: "I am unable to kick this user, make I have valid permissions and this user is not above you!" }) }
            const warnEmbed = new MessageEmbed()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(guildSettings.color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${kickUser.user.tag}** has been kicked from the guild (Warns **${warns}**)`, embeds: [warnEmbed] })
            kickUser.kick(reason).catch((err: Error) => ErrorLog(message.guild!, "KICK_FUNCTION", err, client, message, `${message.author.id}`, `kick.ts`))
            ModLog(true, caseNumberSet, message.guild?.id, "Kick", message.author.id, message, client, Date.now())
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "KICK_COMMAND", err, client, message, `${message.author.id}`, `kick.ts`)
            }
        }
    },
}