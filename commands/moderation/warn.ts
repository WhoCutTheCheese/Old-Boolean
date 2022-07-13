import { Client, GuildChannel, Message, MessageEmbed, TextChannel, Permissions } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
import configFiles from "../../models/config";
module.exports = {
    commands: ['warn', 'w'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    cooldown: 1,
    staffPart: "Mod",
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            let configSettings = await configFiles.findOne({
                guildID: message.guild?.id
            })
            let warnUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
            if (!warnUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            if (warnUser.id === message.author.id) { return message.channel.send({ content: "You cannot issue punishments to yourself." }) }
            if (warnUser.user.bot) { return message.channel.send({ content: "You cannot issue punishments to bots." }) }
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const warns = await Cases.countDocuments({
                guildID: message.guild?.id,
                userID: warnUser.id,
                caseType: "Warn",
            })
            const caseNumberSet = guildSettings.totalCases + 1;
            let remainder
            if(warns !== 0) {
                remainder = warns % configSettings.warnsBeforeMute
            }
            if(remainder == 0) {
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    return message.channel.send({ content: "I can't automatically mute this user! Run **!!check** to finish setting me up!" })
                }
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: warnUser.id,
                    modID: message.author.id,
                    caseType: "Auto Mute",
                    caseReason: reason + " Automatic mute due to excessive warnings.",
                    caseNumber: caseNumberSet,
                    caseLength: "10 Minutes",
                    date: Date.now(),
                })
                newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `warn.ts`))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} **Duration:** 10 Minutes`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${warnUser.user.tag}** has been automatically muted (Warns **${warns}**)`, embeds: [warnEmbed] })
                warnUser.timeout(10000, reason).catch((err: Error) => console.log(err))
                if (configSettings.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You have been muted in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You have been issued a warning in " + message.guild?.name + ` 
                        This was an automatic mute due to excessive warnings.

                        **__Details:__** ${reason}
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Length:** 10 Minutes
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    warnUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                        if(!channel) { return; }
                        (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                    })
                }
    
                ModLog(true, caseNumberSet, message.guild?.id, "Warn", message.author.id, message, client, Date.now())
                return;
            }
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: warnUser.id,
                modID: message.author.id,
                caseType: "Warn",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "None",
                date: Date.now(),
            })
            newCases.save().catch((err: Error) => ErrorLog(message.guild!, "NEW_CASE_FUNCTION", err, client, message, `${message.author.id}`, `warn.ts`))
            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                totalCases: caseNumberSet,
            })
            const warnEmbed = new MessageEmbed()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(guildSettings.color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${warnUser.user.tag}** has been warned (Warns **${warns}**)`, embeds: [warnEmbed] })
            if (configSettings.dmOnPunish == true) {
                const youWereWarned = new MessageEmbed()
                    .setAuthor({ name: "You Were Warned in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                    .setColor(guildSettings.color)
                    .setDescription("You have been issued a warning in " + message.guild?.name + ` 
                    
                    **__Details:__** ${reason}
                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                    > **Case:** ${caseNumberSet}
                    > **Current Warns:** ${warns}`)
                    .setTimestamp()
                warnUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configSettings.modLogChannel);
                    if(!channel) { return; }
                    return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                })
            }

            ModLog(true, caseNumberSet, message.guild?.id, "Warn", message.author.id, message, client, Date.now())
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "WARN_COMMAND", err, client, message, `${message.author.id}`, `warn.ts`)
            }
        }
    },
}