import { GuildMember, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import Config from "../../models/config";
export default {
    category: "Moderation",
    description: "Kick a user.",
    slash: "both",
    aliases: ["k"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    cooldown: "2s",
    permissions: ["KICK_MEMBERS"],
    options: [
        {
            name: "user",
            description: "User to kick.",
            required: true,
            type: "USER",
        }, {
            name: "reason",
            description: "Reason for the punishment",
            required: false,
            type: "STRING",
        }
    ],
    callback: async ({ message, interaction, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to kick! Run **!!check** to finish setting me up!" })
                    return true;
                }
                let kickUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!kickUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) {
                    message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                    return true;
                }
                if (kickUser.id === message.author.id) {
                    message.channel.send({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
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
                newCases.save()
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                if (kickUser.roles.highest.position > message.member!.roles.highest.position) {
                    message.channel.send({ content: "You may not issue punishments to a user higher then you." })
                    return true;
                }
                if (kickUser.id === message.guild.ownerId) {
                    message.channel.send({ content: "Unable to issue punishments to this user!" })
                    return true;
                }
                if (!kickUser.kickable) {
                    message.channel.send({ content: "I am unable to kick this user, make I have valid permissions and this user is not above you!" })
                    return true;
                }
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${kickUser.user.tag}** has been kicked from the guild (Warns **${warns}**)`, embeds: [warnEmbed] })
                if (configuration.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You were muted in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You have been muted in " + message.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    kickUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                    })
                }
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Punishment Issued - ${kickUser.user.tag}`, iconURL: kickUser.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(kickUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${kickUser.user.tag}\n> [${kickUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                kickUser.kick(reason).catch((err: Error) => console.error(err))
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                    interaction.reply({ content: "I don't have permission to kick! Run **!!check** to finish setting me up!" })
                    return true;
                }
                let kickUser = interaction.guild?.members.cache.get(args[0]);
                if (!kickUser) {
                    interaction.reply({ content: "I was unable to find that user!" })
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) {
                    interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)" })
                    return true;
                }
                if (kickUser.id === interaction.user.id) {
                    interaction.reply({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
                const guildSettings = await Guild.findOne({
                    guildID: interaction.guild?.id,
                })
                const warns = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                    userID: kickUser.id,
                    caseType: "Warn",
                })
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: interaction.guild?.id,
                    userID: kickUser.id,
                    modID: interaction.user.id,
                    caseType: "Kick",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save()
                await Guild.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                if (kickUser.roles.highest.position > (interaction.member as GuildMember)!.roles.highest.position) {
                    interaction.reply({ content: "You may not issue punishments to a user higher then you." })
                    return true;
                }
                if (kickUser.id === interaction.guild.ownerId) {
                    interaction.reply({ content: "Unable to issue punishments to this user!" })
                    return true;
                }
                if (!kickUser.kickable) {
                    interaction.reply({ content: "I am unable to kick this user, make I have valid permissions and this user is not above you!" })
                    return true;
                }
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${kickUser.user.tag}** has been kicked from the guild (Warns **${warns}**)`, embeds: [warnEmbed] })
                if (configuration.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You were muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You have been muted in " + interaction.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    kickUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        return (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                    })
                }
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Punishment Issued - ${kickUser.user.tag}`, iconURL: kickUser.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(kickUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${kickUser.user.tag}\n> [${kickUser.user.id}]\n> [<@${interaction.user.id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                kickUser.kick(reason).catch((err: Error) => console.error(err))
            }
        } catch {
            (err: Error) => {
                console.error(err)
            }
        }

    }
} as ICommand