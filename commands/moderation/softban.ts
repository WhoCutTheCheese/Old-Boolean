import { ICommand } from "wokcommands";
import { Channel, GuildMember, MessageEmbed, Permissions, TextChannel, UserResolvable } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Moderation",
    description: "View a case.",
    slash: "both",
    aliases: ['sb'],
    permissions: ["BAN_MEMBERS"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason/Days) {Reason}",
    cooldown: "2s",
    options: [
        {
            name: "user",
            description: 'Soft-Ban user.',
            required: true,
            type: 'USER',
        }, {
            name: "time",
            description: "How many days back to clear. (Optional)",
            required: false,
            type: "STRING",
        }, {
            name: "reason",
            description: "Soft-Ban reason.",
            required: false,
            type: "STRING",
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id,
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to ban members! Run **!!check** to finish setting me up!" })
                    return true;
                }
                let banUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!banUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return true;
                }
                if (banUser.roles.highest.position >= message.member!.roles.highest.position) {
                    message.channel.send({ content: "You cannot issue punishments to users above or equal to you." })
                    return true;
                }
                if (banUser.id === message.author.id) {
                    message.channel.send({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
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
                    if (reason.length > 250) {
                        message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }
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
                    newCases.save()
                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    if (banUser.id === message.guild.ownerId) {
                        message.channel.send({ content: "Unable to issue punishments to this user!" })
                        return true;
                    }
                    if (!banUser.bannable) {
                        message.channel.send({ content: "I am unable to ban this user!" })
                        return true;
                    }
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been banned from " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason, days: 7 }).catch((err: Error) => console.error(err)).then(() => message.guild?.members.unban(banUser?.id as UserResolvable))
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}
                            > [${banUser.user.id}]
                            > [<@${message.author.id}>]
                            <:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Soft-Ban
                            > [**Case:** #${caseNumberSet}]
                            > [**Days Deleted:** ${args[1]}]
                            **Reason:** ${reason}
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                } else if (!Number.isNaN(args[1])) {
                    let reason = args.slice(2).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }
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
                    newCases.save()
                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been banned from " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            return (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason, days: parseInt(args[1]) }).catch((err: Error) => console.error(err)).then(() => message.guild?.members.unban(banUser?.id as UserResolvable))
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}
                            > [${banUser.user.id}]
                            > [<@${message.author.id}>]
                            <:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Soft-Ban
                            > [**Case:** #${caseNumberSet}]
                            > [**Days Deleted:** ${args[1]}]
                            **Reason:** ${reason}
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id,
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    interaction.reply({ content: "I don't have permission to ban members! Run **!!check** to finish setting me up!" })
                    return true;
                }
                let banUser = interaction.guild?.members.cache.get(args[0]);
                if (!banUser) {
                    interaction.reply({ content: "I was unable to find that user!" })
                    return true;
                }
                if (banUser.roles.highest.position >= (interaction.member as GuildMember)!.roles.highest.position) {
                    interaction.reply({ content: "You cannot issue punishments to users above or equal to you." })
                    return true;
                }
                if (banUser.id === interaction.user.id) {
                    interaction.reply({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
                const guildSettings = await Guild.findOne({
                    guildID: interaction.guild?.id,
                })
                const warns = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                    userID: banUser.id,
                    caseType: "Warn",
                })
                if (Number.isNaN(parseInt(args[1]))) {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }
                    const caseNumberSet = guildSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: banUser.id,
                        modID: interaction.user.id,
                        caseType: "Soft-Ban",
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
                    if (banUser.id === interaction.guild.ownerId) {
                        interaction.reply({ content: "Unable to issue punishments to this user!" })
                        return true;
                    }
                    if (!banUser.bannable) {
                        interaction.reply({ content: "I am unable to ban this user!" })
                        return true;
                    }
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been banned from " + interaction.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            return (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason, days: 7 }).catch((err: Error) => console.error(err)).then(() => interaction.guild?.members.unban(banUser?.id as UserResolvable))
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}
                            > [${banUser.user.id}]
                            > [<@${interaction.user.id}>]
                            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                            > [${interaction.user.id}]
                            > [<@${interaction.user.id}>]
                            <:pencil:977391492916207636> **Action:** Soft-Ban
                            > [**Case:** #${caseNumberSet}]
                            > [**Days Deleted:** ${args[1]}]
                            **Reason:** ${reason}
                            **Channel:** <#${interaction.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                } else if (!Number.isNaN(args[1])) {
                    let reason = args.slice(2).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }
                    const caseNumberSet = guildSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: banUser.id,
                        modID: interaction.user.id,
                        caseType: "Soft-Ban",
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
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been soft-banned (Warns **${warns}**)`, embeds: [warnEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been banned from " + interaction.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            return (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                        })
                    }
                    banUser.ban({ reason: reason, days: parseInt(args[1]) }).catch((err: Error) => console.error(err)).then(() => interaction.guild?.members.unban(banUser?.id as UserResolvable))
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}
                            > [${banUser.user.id}]
                            > [<@${interaction.user.id}>]
                            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                            > [${interaction.user.id}]
                            > [<@${interaction.user.id}>]
                            <:pencil:977391492916207636> **Action:** Soft-Ban
                            > [**Case:** #${caseNumberSet}]
                            > [**Days Deleted:** ${args[1]}]
                            **Reason:** ${reason}
                            **Channel:** <#${interaction.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand