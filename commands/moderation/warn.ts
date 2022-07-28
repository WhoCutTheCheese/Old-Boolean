import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed, Permissions, TextChannel, User } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Moderation",
    description: "Issue a warning to a user.",
    slash: "both",
    aliases: ['w'],
    minArgs: 1,
    expectedArgs: "[@User || User ID] (Reason)",
    cooldown: "2s",
    permissions: ["MANAGE_MESSAGES"],
    options: [
        {
            name: "user",
            description: 'Warn user.',
            required: true,
            type: 'USER',
        },
        {
            name: "reason",
            description: 'Warn reason.',
            required: false,
            type: 'STRING',
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: message.guild?.id,
                })
                let warnUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!warnUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) {
                    message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                    return true;
                }
                if (warnUser.id === message.author.id) {
                    message.channel.send({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
                if (warnUser.user.bot) {
                    message.channel.send({ content: "You cannot issue punishments to bots." })
                    return true;
                }
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                    userID: warnUser.id,
                    caseType: "Warn",
                })
                const caseNumberSet = guildSettings.totalCases + 1;
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute
                }
                if (remainder == 0) {
                    if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                        message.channel.send({ content: "I can't automatically mute this user! Run **!!check** to finish setting me up!" })
                        return true;
                    }
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: warnUser.id,
                        modID: message.author.id,
                        caseType: "Warn",
                        caseReason: reason + " Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "10 Minutes",
                        date: Date.now(),
                    })
                    newCases.save().catch((err: Error) => console.error(err))
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
                    if (configuration.dmOnPunish == true) {
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
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }

                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Punishment Issued - ${warnUser.user.tag}`, iconURL: warnUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(warnUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.color)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${warnUser.user.tag}\n> [${warnUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Warn\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                    return true;
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
                newCases.save().catch((err: Error) => console.error(err))
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${warnUser.user.tag}** has been warned (Warns **${warns}**)`, embeds: [warnEmbed] })
                if (configuration.dmOnPunish == true) {
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
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        return true;
                    })
                }

                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Punishment Issued - ${warnUser.user.tag}`, iconURL: warnUser.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(warnUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${warnUser.user.tag}\n> [${warnUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Permanant\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                if (!channel) { return; }
                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: interaction.guild?.id,
                })
                let warnUser = interaction.guild?.members.cache.get(args[0]);
                if (!warnUser) {
                    interaction.reply("Invalid USer")
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) {
                    interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)" })
                    return true;
                }
                if (warnUser.id === interaction.user?.id) {
                    interaction.reply({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
                if (warnUser.user.bot) {
                    interaction.reply({ content: "You cannot issue punishments to bots." })
                    return true;
                }
                const warns = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                    userID: warnUser.id,
                    caseType: "Warn",
                })
                const caseNumberSet = guildSettings.totalCases + 1;
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute
                }
                if (remainder == 0) {
                    if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                        interaction.reply({ content: "I can't automatically mute this user! Run **!!check** to finish setting me up!" })
                        return true;
                    }
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: warnUser.id,
                        modID: interaction.user.id,
                        caseType: "Warn",
                        caseReason: reason + " Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "10 Minutes",
                        date: Date.now(),
                    })
                    newCases.save().catch((err: Error) => console.error(err))
                    await Guild.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user?.tag} | **Reason:** ${reason} **Duration:** 10 Minutes`)
                        .setColor(guildSettings.color)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${warnUser.user.tag}** has been automatically muted (Warns **${warns}**)`, embeds: [warnEmbed] })
                    warnUser.timeout(10000, reason).catch((err: Error) => console.log(err))
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(guildSettings.color)
                            .setDescription("You have been issued a warning in " + interaction.guild?.name + ` 
                        This was an automatic mute due to excessive warnings.

                        **__Details:__** ${reason}
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Length:** 10 Minutes
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        warnUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Punishment Issued - ${(warnUser.user as User).tag}`, iconURL: (warnUser.user as User).displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(warnUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${(warnUser.user as User).tag}\n> [${warnUser.user.id}]\n> [<@${(warnUser.user as User).id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Auto Mute\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                    return;
                }
                const newCases = await new Cases({
                    guildID: interaction.guild?.id,
                    userID: warnUser.id,
                    modID: interaction.user?.id,
                    caseType: "Warn",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save().catch((err: Error) => console.error(err))
                await Guild.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                const warnEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user?.tag} | **Reason:** ${reason}`)
                    .setColor(guildSettings.color)
                interaction.reply({ content: `<:arrow_right:967329549912248341> **${warnUser.user.tag}** has been warned (Warns **${warns}**)`, embeds: [warnEmbed] })
                if (configuration.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You Were Warned in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You have been issued a warning in " + interaction.guild?.name + ` 
                    
                    **__Details:__** ${reason}
                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                    > **Case:** ${caseNumberSet}
                    > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    warnUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        return true;
                    })
                }
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Punishment Issued - ${(warnUser.user as User).tag}`, iconURL: (warnUser.user as User).displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(warnUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${(warnUser.user as User).tag}\n> [${caseNumberSet}]\n> [<@${(warnUser.user as User).id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Warn\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                if (!channel) { return; }
                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })


            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand