import { ICommand } from "wokcommands";
import { MessageEmbed, Permissions, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Moderation",
    description: "Unmute a user.",
    slash: "both",
    aliases: ['um'],
    minArgs: 1,
    expectedArgs: "[@User/User ID]",
    permissions: ["MANAGE_MESSAGES"],
    cooldown: "2s",
    options: [
        {
            name: "user",
            description: 'User to unmute.',
            required: true,
            type: 'USER',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to remove bans! Run **!!check** to finish setting me up!" })
                    return;
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to remove bans! Run **!!check** to finish setting me up!" })
                    return;
                }
                const serverSettings = await Guild.findOne({
                    guildID: message.guild?.id
                })
                let muteUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (muteUser?.id === message.author.id) {
                    message.channel.send({ content: "You're not muted..." })
                    return;
                }
                if (!muteUser) {
                    message.channel.send({ content: "User now found!" })
                    return;
                }
                if (configuration.muteRoleID === "None") {
                    if (muteUser?.communicationDisabledUntil) {
                        const caseNumberSet = serverSettings.totalCases + 1;
                        const newCases = await new Cases({
                            guildID: message.guild?.id,
                            userID: muteUser?.id,
                            modID: message.author.id,
                            caseType: "Unmute",
                            caseReason: "User unmuted.",
                            caseNumber: caseNumberSet,
                            caseLength: "NONE",
                            date: Date.now(),
                        })
                        newCases.save()

                        await Guild.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            totalCases: caseNumberSet,
                        })
                        muteUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                        const unbanEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag}`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                            > [${muteUser?.id}]
                            <:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Unmute
                            > [**Case:** #${caseNumberSet}]
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    } else {
                        message.channel.send("User is not muted!")
                        return;
                    }
                }
                if (muteUser?.roles.cache.has(configuration.muteRoleID)) {
                    const caseNumberSet = serverSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: muteUser?.id,
                        modID: message.author.id,
                        caseType: "Unmute",
                        caseReason: "User unmuted.",
                        caseNumber: caseNumberSet,
                        caseLength: "NONE",
                        date: Date.now(),
                    })
                    newCases.save()

                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    muteUser.roles.remove(configuration.muteRoleID).catch((err: Error) => console.log(err))
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Unmute
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else if (muteUser?.communicationDisabledUntil) {
                    const caseNumberSet = serverSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: muteUser?.id,
                        modID: message.author.id,
                        caseType: "Umute",
                        caseReason: "User unmuted.",
                        caseNumber: caseNumberSet,
                        caseLength: "NONE",
                        date: Date.now(),
                    })
                    newCases.save()

                    await Guild.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    muteUser.roles.remove(configuration.muteRoleID).catch((err: Error) => console.log(err))
                    muteUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Unmute
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else {
                    message.channel.send({ content: "User is not muted." })
                    return;
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    interaction.reply({ content: "**`[ Error ]`** I don't have permission to remove bans! Run **!!check** to finish setting me up!", ephemeral: true })
                    return;
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    interaction.reply({ content: "**`[ Error ]`** I don't have permission to remove bans! Run **!!check** to finish setting me up!", ephemeral: true })
                    return;
                }
                const serverSettings = await Guild.findOne({
                    guildID: interaction.guild?.id
                })
                let muteUser = interaction.guild?.members.cache.get(args[0]);
                if (muteUser?.id === interaction.user.id) {
                    interaction.reply({ content: "You're not muted...", ephemeral: true })
                    return;
                }
                if (!muteUser) {
                    interaction.reply({ content: "User now found!", ephemeral: true })
                    return;
                }
                if (configuration.muteRoleID === "None") {
                    if (muteUser?.communicationDisabledUntil) {
                        const caseNumberSet = serverSettings.totalCases + 1;
                        const newCases = await new Cases({
                            guildID: interaction.guild?.id,
                            userID: muteUser?.id,
                            modID: interaction.user.id,
                            caseType: "Unmute",
                            caseReason: "User unmuted.",
                            caseNumber: caseNumberSet,
                            caseLength: "NONE",
                            date: Date.now(),
                        })
                        newCases.save()

                        await Guild.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            totalCases: caseNumberSet,
                        })
                        muteUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                        const unbanEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag}`)
                            .setColor(configuration.embedColor)
                            interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                            > [${muteUser?.id}]
                            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                            > [${interaction.user.id}]
                            > [<@${interaction.user.id}>]
                            <:pencil:977391492916207636> **Action:** Unmute
                            > [**Case:** #${caseNumberSet}]
                            **Channel:** <#${interaction.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    } else {
                        interaction.reply({ content: "User is not muted!", ephemeral: true  })
                        return;
                    }
                }
                if (muteUser?.roles.cache.has(configuration.muteRoleID)) {
                    const caseNumberSet = serverSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: muteUser?.id,
                        modID: interaction.user.id,
                        caseType: "Unmute",
                        caseReason: "User unmuted.",
                        caseNumber: caseNumberSet,
                        caseLength: "NONE",
                        date: Date.now(),
                    })
                    newCases.save()

                    await Guild.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    muteUser.roles.remove(configuration.muteRoleID).catch((err: Error) => console.log(err))
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag}`)
                        .setColor(configuration.embedColor)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Unmute
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else if (muteUser?.communicationDisabledUntil) {
                    const caseNumberSet = serverSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: muteUser?.id,
                        modID: interaction.user.id,
                        caseType: "Umute",
                        caseReason: "User unmuted.",
                        caseNumber: caseNumberSet,
                        caseLength: "NONE",
                        date: Date.now(),
                    })
                    newCases.save()

                    await Guild.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    muteUser.roles.remove(configuration.muteRoleID).catch((err: Error) => console.log(err))
                    muteUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag}`)
                        .setColor(configuration.embedColor)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been unmuted.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Umuted - ${muteUser.user.tag}`, iconURL: muteUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Unmute
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else {
                    interaction.reply({ content: "User is not muted.", ephemeral: true })
                    return;
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