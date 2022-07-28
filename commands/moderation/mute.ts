import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed, Permissions, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const ms = require('ms');
export default {
    category: "Moderation",
    description: "View a case.",
    slash: "both",
    aliases: ['m', 'silence'],
    permissions: ["MANAGE_MESSAGES"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason/Timeframe) {Reason}",
    cooldown: "2s",
    options: [
        {
            name: "user",
            description: 'User/User ID.',
            required: true,
            type: 'USER',
        }, {
            name: "length",
            description: "Length of mute. (Optional)",
            required: false,
            type: "STRING",
        }, {
            name: "reason",
            description: "Reason, only for timed mutes!!!!!!",
            required: false,
            type: "STRING",
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to mute! Run **!!check** to finish setting me up!" })
                    return true;
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    message.channel.send("**`[ Error ]`** I don't have permission to mute! Run **!!check** to finish setting me up!")
                    return true;
                }
                const serverSettings = await Guild.findOne({
                    guildID: message.guild?.id,
                })
                let muteUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!muteUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return true;
                }
                if (message.author.id !== message.guild.ownerId) {
                    if (muteUser.roles.highest.position >= (message.member as GuildMember)!.roles.highest.position) {
                        message.channel.send({ content: "You may not issue punishments to a user higher or equal to you." })
                        return true;
                    }
                }
                if (muteUser.id === message.guild.ownerId) {
                    message.channel.send({ content: "Unable to issue punishments to this user!" })
                    return true;
                }
                if (muteUser.id === message.author.id) {
                    message.channel.send({ content: "You cannot issue punishments to yourself." })
                    return true;
                }
                if (muteUser.user.bot) {
                    message.channel.send({ content: "You cannot issue punishments to bots." })
                    return true;
                }
                const warns = await Cases.countDocuments({
                    guildID: message.guild.id,
                    userID: message.author.id,
                    caseType: "Warn",
                })
                if (!/^\d/.test(args[1])) {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }
                    if (!configuration) {
                        message.channel.send({ content: "An unknown error occurred, contact support if this persists." })
                        return true;
                    }
                    if (configuration.muteRoleID === "None") {
                        message.channel.send({ content: "You do not have a mute role!" })
                        return true;
                    }
                    const muteRole = message.guild?.roles.cache.get(configuration.muteRoleID)
                    if (!muteRole) {
                        message.channel.send({ content: "Your mute role does not exist or has been deleted." })
                        return true;
                    }
                    const caseNumberSet = serverSettings.totalCases + 1;
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
                    newCases.save().catch((err: Error) => console.error(err))
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
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You were muted in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been muted in " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                            return true;
                        })
                    }
                    muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                    const muteEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser.user.id}]
                        > [<@${message.author.id}>]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Duration:** Permanent]
                        **Reason:** ${reason}
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                } else if (/^\d/.test(args[1])) {
                    if (muteUser.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                        message.channel.send({ content: "This user is unable to be timed out!" })
                        return true;
                    }
                    if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {
                        let time1 = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                        if (!Number.isNaN(parseInt(args[1]))) {

                            let reason = args.slice(2).join(" ")
                            if (!reason) { reason = "No reason provided" }
                            if (reason.length > 250) {
                                message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                                return true;
                            }

                            let type: any
                            if (args[1].endsWith("s")) {
                                type = "second(s)"
                            } else if (args[1].endsWith("m")) {
                                type = "minute(s)"
                            } else if (args[1].endsWith("h")) {
                                type = "hour(s)"
                            } else if (args[1].endsWith("d")) {
                                type = "day(s)"
                            } else if (args[1].endsWith("w")) {
                                type = "week(s)"
                            }

                            let time: number;
                            if (type === "second(s)") {
                                time = parseInt(time1);
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "minute(s)") {
                                time = parseInt(time1) * 60
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "hour(s)") {
                                time = parseInt(time1) * 60 * 60
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "day(s)") {
                                time = parseInt(time1) * 60 * 60 * 24
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "week(s)") {
                                time = parseInt(time1) * 60 * 60 * 24 * 7
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            }

                            const caseNumberSet = serverSettings.totalCases + 1;

                            const newCases = await new Cases({
                                guildID: message.guild?.id,
                                userID: muteUser.id,
                                modID: message.author.id,
                                caseType: "Mute",
                                caseReason: reason,
                                caseNumber: caseNumberSet,
                                caseLength: time1 + " " + type,
                                date: Date.now(),
                            })

                            await Guild.findOneAndUpdate({
                                guildID: message.guild.id,
                            }, {
                                totalCases: caseNumberSet,
                            })

                            if (configuration.dmOnPunish == true) {
                                const youWereWarned = new MessageEmbed()
                                    .setAuthor({ name: "You have been muted in " + message.guild.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                    .setColor(configuration.embedColor)
                                    .setDescription("You were muted in " + message.guild?.name + ` 
                                
                                    **__Details:__** ${reason}
                                    > **Duration:** ${time1 + " " + type}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                    .setTimestamp()
                                muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                    if (!channel) { return; }
                                    (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                })
                            }
                            const modLogEmbed = new MessageEmbed()
                                .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                                .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                                .setColor(configuration.color)
                                .setTimestamp()
                                .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                                > [${muteUser.user.id}]
                                > [<@${message.author.id}>]
                                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                                > [${message.author.id}]
                                > [<@${message.author.id}>]
                                <:pencil:977391492916207636> **Action:** Mute
                                > [**Case:** #${caseNumberSet}]
                                > [**Duration:** ${time!} ${type}]
                                **Reason:** ${reason}
                                **Channel:** <#${message.channel?.id}>
                                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                            muteUser.timeout(ms(time! + "s"), reason)
                            const muteEmbed = new MessageEmbed()
                                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** ${time1} ${type} | **Reason:** ${reason}`)
                                .setColor(configuration.embedColor)
                            message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })

                        } else {
                            let reason = args.slice(1).join(" ")
                            if (!reason) { reason = "No reason provided" }
                            if (reason.length > 250) {
                                message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                                return true;
                            }
                            if (!configuration) {
                                message.channel.send({ content: "An unknown error occurred, contact support if this persists." })
                                return true;
                            }
                            if (configuration.muteRoleID === "None") {
                                message.channel.send({ content: "You do not have a mute role!" })
                                return true;
                            }
                            const muteRole = message.guild?.roles.cache.get(configuration.muteRoleID)
                            if (!muteRole) {
                                message.channel.send({ content: "Your mute role does not exist or has been deleted." })
                                return true;
                            }
                            const caseNumberSet = serverSettings.totalCases + 1;
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
                            newCases.save().catch((err: Error) => console.error(err))
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
                            if (configuration.dmOnPunish == true) {
                                const youWereWarned = new MessageEmbed()
                                    .setAuthor({ name: "You were muted in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                    .setColor(configuration.embedColor)
                                    .setDescription("You have been muted in " + message.guild?.name + ` 
                                    
                                    **__Details:__** ${reason}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                    .setTimestamp()
                                muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                    if (!channel) { return; }
                                    (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                    return true;
                                })
                            }
                            muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                            const muteEmbed = new MessageEmbed()
                                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                                .setColor(configuration.embedColor)
                            message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                            const modLogEmbed = new MessageEmbed()
                                .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                                .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                                .setColor(configuration.embedColor)
                                .setTimestamp()
                                .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                                > [${muteUser.user.id}]
                                > [<@${message.author.id}>]
                                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                                > [${message.author.id}]
                                > [<@${message.author.id}>]
                                <:pencil:977391492916207636> **Action:** Mute
                                > [**Case:** #${caseNumberSet}]
                                > [**Duration:** Permanent]
                                **Reason:** ${reason}
                                **Channel:** <#${message.channel?.id}>
                                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    } else {
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                            return true;
                        }
                        if (!configuration) {
                            message.channel.send({ content: "An unknown error occurred, contact support if this persists." })
                            return true;
                        }
                        if (configuration.muteRoleID === "None") {
                            message.channel.send({ content: "You do not have a mute role!" })
                            return true;
                        }
                        const muteRole = message.guild?.roles.cache.get(configuration.muteRoleID)
                        if (!muteRole) {
                            message.channel.send({ content: "Your mute role does not exist or has been deleted." })
                            return true;
                        }
                        const caseNumberSet = serverSettings.totalCases + 1;
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
                        newCases.save().catch((err: Error) => console.error(err))
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
                        if (configuration.dmOnPunish == true) {
                            const youWereWarned = new MessageEmbed()
                                .setAuthor({ name: "You were muted in " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription("You have been muted in " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                return true;
                            })
                        }
                        muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                        const muteEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                            > [${muteUser.user.id}]
                            > [<@${message.author.id}>]
                            <:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Mute
                            > [**Case:** #${caseNumberSet}]
                            > [**Duration:** Permanent]
                                **Reason:** ${reason}
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS) || !interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    interaction.reply({ content: "I don't have permission to mute! Run **!!check** to finish setting me up!" })
                    return true;
                }
                const serverSettings = await Guild.findOne({
                    guildID: interaction.guild?.id,
                })
                let muteUser = interaction.guild?.members.cache.get(args[0]);
                if (!muteUser) {
                    interaction.reply({ content: "I was unable to find that user!", ephemeral: true })
                    return true;
                }
                if (interaction.user.id !== interaction.guild.ownerId) {
                    if (muteUser.roles.highest.position >= (interaction.member as GuildMember)!.roles.highest.position) {
                        interaction.reply({ content: "You may not issue punishments to a user higher or equal to you.", ephemeral: true })
                        return true;
                    }
                }
                if (muteUser.id === interaction.guild.ownerId) {
                    interaction.reply({ content: "Unable to issue punishments to this user!", ephemeral: true })
                    return true;
                }
                if (muteUser.id === interaction.user.id) {
                    interaction.reply({ content: "You cannot issue punishments to yourself.", ephemeral: true })
                    return true;
                }
                if (muteUser.user.bot) {
                    interaction.reply({ content: "You cannot issue punishments to bots.", ephemeral: true })
                    return true;
                }
                const warns = await Cases.countDocuments({
                    guildID: interaction.guild.id,
                    userID: interaction.user.id,
                    caseType: "Warn",
                })
                if (!/^\d/.test(args[1])) {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                        return true;
                    }
                    if (!configuration) {
                        interaction.reply({ content: "An unknown error occurred, contact support if this persists.", ephemeral: true })
                        return true;
                    }
                    if (configuration.muteRoleID === "None") {
                        interaction.reply({ content: "You do not have a mute role!", ephemeral: true })
                        return true;
                    }
                    const muteRole = interaction.guild?.roles.cache.get(configuration.muteRoleID)
                    if (!muteRole) {
                        interaction.reply({ content: "Your mute role does not exist or has been deleted.", ephemeral: true })
                        return true;
                    }
                    const caseNumberSet = serverSettings.totalCases + 1;
                    const newCases = await new Cases({
                        guildID: interaction.guild?.id,
                        userID: muteUser.id,
                        modID: interaction.user.id,
                        caseType: "Mute",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: "Permanent",
                        date: Date.now(),
                    })
                    newCases.save().catch((err: Error) => console.error(err))
                    await Guild.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })
                    const warns = await Cases.countDocuments({
                        guildID: interaction.guild?.id,
                        userID: muteUser.id,
                        caseType: "Warn",
                    })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You were muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("You have been muted in " + interaction.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                            return true;
                        })
                    }
                    muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                    const muteEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser.user.id}]
                        > [<@${interaction.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Duration:** Permanent]
                        **Reason:** ${reason}
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                } else if (/^\d/.test(args[1])) {
                    if (muteUser.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                        interaction.reply({ content: "This user is unable to be timed out!", ephemeral: true })
                        return true;
                    }
                    if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {
                        let time1 = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                        if (!Number.isNaN(parseInt(args[1]))) {

                            let reason = args.slice(2).join(" ")
                            if (!reason) { reason = "No reason provided" }
                            if (reason.length > 250) {
                                interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                                return true;
                            }

                            let type: any
                            if (args[1].endsWith("s")) {
                                type = "second(s)"
                            } else if (args[1].endsWith("m")) {
                                type = "minute(s)"
                            } else if (args[1].endsWith("h")) {
                                type = "hour(s)"
                            } else if (args[1].endsWith("d")) {
                                type = "day(s)"
                            } else if (args[1].endsWith("w")) {
                                type = "week(s)"
                            }

                            let time: number;
                            if (type === "second(s)") {
                                time = parseInt(time1);
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "minute(s)") {
                                time = parseInt(time1) * 60
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "hour(s)") {
                                time = parseInt(time1) * 60 * 60
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "day(s)") {
                                time = parseInt(time1) * 60 * 60 * 24
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            } else if (type === "week(s)") {
                                time = parseInt(time1) * 60 * 60 * 24 * 7
                                if (time >= 2332800) {
                                    return "Exceeds maximum duration (27days)"
                                }
                            }

                            const caseNumberSet = serverSettings.totalCases + 1;

                            const newCases = await new Cases({
                                guildID: interaction.guild?.id,
                                userID: muteUser.id,
                                modID: interaction.user.id,
                                caseType: "Mute",
                                caseReason: reason,
                                caseNumber: caseNumberSet,
                                caseLength: time1 + " " + type,
                                date: Date.now(),
                            })

                            await Guild.findOneAndUpdate({
                                guildID: interaction.guild.id,
                            }, {
                                totalCases: caseNumberSet,
                            })

                            if (configuration.dmOnPunish == true) {
                                const youWereWarned = new MessageEmbed()
                                    .setAuthor({ name: "You have been muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                                    .setColor(configuration.embedColor)
                                    .setDescription("You were muted in " + interaction.guild?.name + ` 
                                
                                    **__Details:__** ${reason}
                                    > **Duration:** ${time1 + " " + type}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                    .setTimestamp()
                                muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                    if (!channel) { return; }
                                    (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                })
                            }
                            const modLogEmbed = new MessageEmbed()
                                .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                                .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                                .setColor(configuration.embedColor)
                                .setTimestamp()
                                .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                                > [${muteUser.user.id}]
                                > [<@${interaction.user.id}>]
                                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                                > [${interaction.user.id}]
                                > [<@${interaction.user.id}>]
                                <:pencil:977391492916207636> **Action:** Mute
                                > [**Case:** #${caseNumberSet}]
                                > [**Duration:** ${time!} ${type}]
                                **Reason:** ${reason}
                                **Channel:** <#${interaction.channel?.id}>
                                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                            muteUser.timeout(ms(time! + "s"), reason)
                            const muteEmbed = new MessageEmbed()
                                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Duration:** ${time1} ${type} | **Reason:** ${reason}`)
                                .setColor(configuration.embedColor)
                            interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })

                        } else {
                            let reason = args.slice(1).join(" ")
                            if (!reason) { reason = "No reason provided" }
                            if (reason.length > 250) {
                                interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                                return true;
                            }
                            if (!configuration) {
                                interaction.reply({ content: "An unknown error occurred, contact support if this persists.", ephemeral: true })
                                return true;
                            }
                            if (configuration.muteRoleID === "None") {
                                interaction.reply({ content: "You do not have a mute role!", ephemeral: true })
                                return true;
                            }
                            const muteRole = interaction.guild?.roles.cache.get(configuration.muteRoleID)
                            if (!muteRole) {
                                interaction.reply({ content: "Your mute role does not exist or has been deleted.", ephemeral: true })
                                return true;
                            }
                            const caseNumberSet = serverSettings.totalCases + 1;
                            const newCases = await new Cases({
                                guildID: interaction.guild?.id,
                                userID: muteUser.id,
                                modID: interaction.user.id,
                                caseType: "Mute",
                                caseReason: reason,
                                caseNumber: caseNumberSet,
                                caseLength: "Permanent",
                                date: Date.now(),
                            })
                            newCases.save().catch((err: Error) => console.error(err))
                            await Guild.findOneAndUpdate({
                                guildID: interaction.guild?.id,
                            }, {
                                totalCases: caseNumberSet,
                            })
                            const warns = await Cases.countDocuments({
                                guildID: interaction.guild?.id,
                                userID: muteUser.id,
                                caseType: "Warn",
                            })
                            if (configuration.dmOnPunish == true) {
                                const youWereWarned = new MessageEmbed()
                                    .setAuthor({ name: "You were muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                                    .setColor(configuration.embedColor)
                                    .setDescription("You have been muted in " + interaction.guild?.name + ` 
                                    
                                    **__Details:__** ${reason}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                    .setTimestamp()
                                muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                    if (!channel) { return; }
                                    (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                    return true;
                                })
                            }
                            muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                            const muteEmbed = new MessageEmbed()
                                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                                .setColor(configuration.embedColor)
                            interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                            const modLogEmbed = new MessageEmbed()
                                .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                                .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                                .setColor(configuration.embedColor)
                                .setTimestamp()
                                .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                                > [${muteUser.user.id}]
                                > [<@${interaction.user.id}>]
                                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                                > [${interaction.user.id}]
                                > [<@${interaction.user.id}>]
                                <:pencil:977391492916207636> **Action:** Mute
                                > [**Case:** #${caseNumberSet}]
                                > [**Duration:** Permanent]
                                **Reason:** ${reason}
                                **Channel:** <#${interaction.user?.id}>
                                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    } else {
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                            return true;
                        }
                        if (!configuration) {
                            interaction.reply({ content: "An unknown error occurred, contact support if this persists.", ephemeral: true })
                            return true;
                        }
                        if (configuration.muteRoleID === "None") {
                            interaction.reply({ content: "You do not have a mute role!", ephemeral: true })
                            return true;
                        }
                        const muteRole = interaction.guild?.roles.cache.get(configuration.muteRoleID)
                        if (!muteRole) {
                            interaction.reply({ content: "Your mute role does not exist or has been deleted.", ephemeral: true })
                            return true;
                        }
                        const caseNumberSet = serverSettings.totalCases + 1;
                        const newCases = await new Cases({
                            guildID: interaction.guild?.id,
                            userID: muteUser.id,
                            modID: interaction.user.id,
                            caseType: "Mute",
                            caseReason: reason,
                            caseNumber: caseNumberSet,
                            caseLength: "Permanent",
                            date: Date.now(),
                        })
                        newCases.save().catch((err: Error) => console.error(err))
                        await Guild.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            totalCases: caseNumberSet,
                        })
                        const warns = await Cases.countDocuments({
                            guildID: interaction.guild?.id,
                            userID: muteUser.id,
                            caseType: "Warn",
                        })
                        if (configuration.dmOnPunish == true) {
                            const youWereWarned = new MessageEmbed()
                                .setAuthor({ name: "You were muted in " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription("You have been muted in " + interaction.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            muteUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                (interaction.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM user." })
                                return true;
                            })
                        }
                        muteUser.roles.add(muteRole).catch((err: Error) => console.error(err));
                        const muteEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Duration:** Permanent | **Reason:** ${reason}`)
                            .setColor(configuration.embedColor)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${muteUser.user.tag}** has been muted (Warns **${warns}**)`, embeds: [muteEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Muted - ${muteUser.user.tag}`, iconURL: muteUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(muteUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${muteUser.user.tag}
                        > [${muteUser.user.id}]
                        > [<@${interaction.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Duration:** Permanent]
                        **Reason:** ${reason}
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
        function endsWithAny(suffixes: any, string: any) {
            return suffixes.some(function (suffix: any) {
                return string.endsWith(suffix);
            });
        }
    }
} as ICommand