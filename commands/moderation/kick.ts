import { Client, Message, MessageEmbed, Permissions } from "discord.js";
const Guild = require("../../models/guild");
const Cases = require("../../models/cases");
module.exports = {
    commands: ['kick', 'k'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    cooldown: 2,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return message.channel.send({ content: "I don't have permission to kick! Run **!!check** to finish setting me up!" })
        }
        let kickUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if(!kickUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
        let reason = args.slice(1).join(" ")
        if(!reason) { reason = "No reason provided" }
        if(reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
        if(kickUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
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
        newCases.save().catch()
        await Guild.findOneAndUpdate({
            guildID: message.guild?.id,
        }, {
            totalCases: caseNumberSet,
        })
        if (kickUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }
        const warnEmbed = new MessageEmbed()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
            .setColor(guildSettings.color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${kickUser.user.tag}** has been kicked from the guild (Warns **${warns}**)`, embeds: [warnEmbed] })
        kickUser.kick(reason).catch((err: any) => console.log(err))
        ModLog(true, caseNumberSet, message.guild?.id, "Kick", message.author.id, message, client, Date.now())
        
    },
}