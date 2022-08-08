import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed, Permissions, TextChannel } from "discord.js";
import Config from "../../models/config";
import Guild from "../../models/guild";
import Case from "../../models/cases";
import Bans from "../../models/ban";
export default {
    category: "Moderation",
    description: "Ban a user.",
    slash: "both",
    aliases: ['b'],
    minArgs: 1,
    expectedArgs: "[@User/UserID] (Time/Reason) {Reason}",
    cooldown: "2s",
    permissions: ["BAN_MEMBERS"],
    options: [
        {
            name: "user",
            description: 'Ban user.',
            required: true,
            type: 'USER',
        }, {
            name: "length",
            description: 'Length for the ban. (Optional)',
            required: false,
            type: 'STRING',
        }, {
            name: "reason",
            description: 'Ban reason for a timed ban.',
            required: false,
            type: 'STRING',
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        if (message) {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                message.channel.send({ content: "**`[ Error ]`** I don't have permission to ban members! Run **!!check** to finish setting me up!" })
                return true;
            }
            const configuration = await Config.findOne({
                guildID: message.guild?.id
            })
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const Cases = await Case.findOne({
                guildID: message.guild?.id,
            })
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
            const warns = await Case.countDocuments({
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

                const caseNumberSet = guildSettings.totalCases + 1;

                const newCases = await new Case({
                    guildID: message.guild?.id,
                    userID: banUser.id,
                    modID: message.author.id,
                    caseType: "Ban",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "Permanent",
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

                const banEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                    .setColor(configuration.embedColor)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })

                if (configuration.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You were banned from " + message.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Duration:** Permanent
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                        }
                        return true;
                    })
                }

                banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })

                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            } else if (/^\d/.test(args[1])) {
                if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {
                    let time1 = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                    if (!Number.isNaN(time1)) {

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
                        } else if (type === "minute(s)") {
                            time = parseInt(time1) * 60
                        } else if (type === "hour(s)") {
                            time = parseInt(time1) * 60 * 60
                        } else if (type === "day(s)") {
                            time = parseInt(time1) * 60 * 60 * 24
                        } else if (type === "week(s)") {
                            time = parseInt(time1) * 60 * 60 * 24 * 7
                        }

                        const expires = new Date()

                        expires.setSeconds(expires.getSeconds() + time!)

                        const banExpire = await new Bans({
                            guildID: message.guild.id,
                            userID: banUser.id,
                            caseNumber: 0,
                            caseEndDate: expires,
                        })
                        banExpire.save().catch((err: Error) => console.log(err + " This error was not caught by WOKCommands."))

                        const caseNumberSet = guildSettings.totalCases + 1;

                        const newCases = await new Case({
                            guildID: message.guild?.id,
                            userID: banUser.id,
                            modID: message.author.id,
                            caseType: "Ban",
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
                                .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(guildSettings.color)
                                .setDescription("You were banned from " + message.guild?.name + ` 
                                
                                    **__Details:__** ${reason}
                                    > **Duration:** ${time1 + " " + type}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        }

                        banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => console.error(err));

                        const banEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                            .setColor(guildSettings.color)
                        message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been banned. **Duration:** ${time1 + " " + type} (Warns **${warns}**)`, embeds: [banEmbed] })

                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }

                    } else {
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                            return true;
                        }

                        const caseNumberSet = guildSettings.totalCases + 1;

                        const newCases = await new Case({
                            guildID: message.guild?.id,
                            userID: banUser.id,
                            modID: message.author.id,
                            caseType: "Ban",
                            caseReason: reason,
                            caseNumber: caseNumberSet,
                            caseLength: "Permanent",
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

                        const banEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })
                        if (configuration.dmOnPunish == true) {
                            const youWereWarned = new MessageEmbed()
                                .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(guildSettings.color)
                                .setDescription("You were banned from " + message.guild?.name + ` 
                                
                                **__Details:__** ${reason}
                                > **Duration:** Permanent
                                > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                > **Case:** ${caseNumberSet}
                                > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        }
                        banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }

                    }
                } else {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return true;
                    }

                    const caseNumberSet = guildSettings.totalCases + 1;

                    const newCases = await new Case({
                        guildID: message.guild?.id,
                        userID: banUser.id,
                        modID: message.author.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: "Permanent",
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

                    const banEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + message.guild?.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(guildSettings.color)
                            .setDescription("You were banned from " + message.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Duration:** Permanent
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        })
                    }

                    banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })

                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${message.author.id}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }

                }
            }
            return true;
        } else if (interaction) {
            if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                interaction.reply({ content: "I don't have permission to ban members! Run **!!check** to finish setting me up!" })
                return true;
            }
            const configuration = await Config.findOne({
                guildID: interaction.guild?.id
            })
            const guildSettings = await Guild.findOne({
                guildID: interaction.guild?.id,
            })
            const Cases = await Case.findOne({
                guildID: interaction.guild?.id,
            })
            let banUser = interaction.guild?.members.cache.get(args[0]);
            if (!banUser) {
                interaction.reply({ content: "I was unable to find that user!", ephemeral: true })
                return true;
            }
            if (banUser.roles.highest.position >= (interaction.member as GuildMember)?.roles.highest.position) {
                interaction.reply({ content: "You cannot issue punishments to users above or equal to you.", ephemeral: true })
                return true;
            }
            if (banUser.id === interaction.user.id) {
                interaction.reply({ content: "You cannot issue punishments to yourself.", ephemeral: true })
                return true;
            }
            const warns = await Case.countDocuments({
                guildID: interaction.guild?.id,
                userID: banUser.id,
                caseType: "Warn",
            });
            if (!/^\d/.test(args[1])) {
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) {
                    interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                    return true;
                }

                const caseNumberSet = guildSettings.totalCases + 1;

                const newCases = await new Case({
                    guildID: interaction.guild?.id,
                    userID: banUser.id,
                    modID: interaction.user.id,
                    caseType: "Ban",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "Permanent",
                    date: Date.now(),
                })
                newCases.save()

                await Guild.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })

                if (banUser.id === interaction.guild.ownerId) {
                    interaction.reply({ content: "Unable to issue punishments to this user!", ephemeral: true })
                    return true;
                }
                if (!banUser.bannable) {
                    interaction.reply({ content: "I am unable to ban this user!", ephemeral: true })
                    return true;
                }

                const banEmbed = new MessageEmbed()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                    .setColor(configuration.embedColor)
                interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })

                if (configuration.dmOnPunish == true) {
                    const youWereWarned = new MessageEmbed()
                        .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription("You were banned from " + interaction.guild?.name + ` 
                        
                        **__Details:__** ${reason}
                        > **Duration:** Permanent
                        > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                        > **Case:** ${caseNumberSet}
                        > **Current Warns:** ${warns}`)
                        .setTimestamp()
                    banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                        }
                    })
                }

                banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })

                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${interaction.user?.id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            } else if (/^\d/.test(args[1])) {
                if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {
                    let time1 = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                    if (!Number.isNaN(time1)) {

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
                        } else if (type === "minute(s)") {
                            time = parseInt(time1) * 60
                        } else if (type === "hour(s)") {
                            time = parseInt(time1) * 60 * 60
                        } else if (type === "day(s)") {
                            time = parseInt(time1) * 60 * 60 * 24
                        } else if (type === "week(s)") {
                            time = parseInt(time1) * 60 * 60 * 24 * 7
                        }

                        const expires = new Date()

                        expires.setSeconds(expires.getSeconds() + time!)

                        const banExpire = await new Bans({
                            guildID: interaction.guild.id,
                            userID: banUser.id,
                            caseNumber: 0,
                            caseEndDate: expires,
                        })
                        banExpire.save().catch((err: Error) => console.log(err))

                        const caseNumberSet = guildSettings.totalCases + 1;

                        const newCases = await new Case({
                            guildID: interaction.guild?.id,
                            userID: banUser.id,
                            modID: interaction.user.id,
                            caseType: "Ban",
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
                                .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(guildSettings.color)
                                .setDescription("You were banned from " + interaction.guild?.name + ` 
                                
                                    **__Details:__** ${reason}
                                    > **Duration:** ${time1 + " " + type}
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        }

                        banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => console.error(err));

                        const banEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                            .setColor(guildSettings.color)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been banned. **Duration:** ${time1 + " " + type} (Warns **${warns}**)`, embeds: [banEmbed] })

                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${interaction.user.id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.user.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }

                    } else {
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                            return true;
                        }

                        const caseNumberSet = guildSettings.totalCases + 1;

                        const newCases = await new Case({
                            guildID: interaction.guild?.id,
                            userID: banUser.id,
                            modID: interaction.user.id,
                            caseType: "Ban",
                            caseReason: reason,
                            caseNumber: caseNumberSet,
                            caseLength: "Permanent",
                            date: Date.now(),
                        })
                        newCases.save()

                        await Guild.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            totalCases: caseNumberSet,
                        })

                        if (banUser.id === interaction.guild.ownerId) {
                            interaction.reply({ content: "Unable to issue punishments to this user!", ephemeral: true })
                            return true;
                        }
                        if (!banUser.bannable) {
                            interaction.reply({ content: "I am unable to ban this user!", ephemeral: true })
                            return true;
                        }

                        const banEmbed = new MessageEmbed()
                            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                            .setColor(configuration.embedColor)
                        interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })
                        if (configuration.dmOnPunish == true) {
                            const youWereWarned = new MessageEmbed()
                                .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                                .setColor(guildSettings.color)
                                .setDescription("You were banned from " + interaction.guild?.name + ` 
                                
                                    **__Details:__** ${reason}
                                    > **Duration:** Permanent
                                    > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                                    > **Case:** ${caseNumberSet}
                                    > **Current Warns:** ${warns}`)
                                .setTimestamp()
                            banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        }
                        banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${interaction.user.id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    }
                } else {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                        return true;
                    }

                    const caseNumberSet = guildSettings.totalCases + 1;

                    const newCases = await new Case({
                        guildID: interaction.guild?.id,
                        userID: banUser.id,
                        modID: interaction.user.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: "Permanent",
                        date: Date.now(),
                    })
                    newCases.save()

                    await Guild.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        totalCases: caseNumberSet,
                    })

                    if (banUser.id === interaction.guild.ownerId) {
                        interaction.reply({ content: "Unable to issue punishments to this user!", ephemeral: true })
                        return true;
                    }
                    if (!banUser.bannable) {
                        interaction.reply({ content: "I am unable to ban this user!", ephemeral: true })
                        return true;
                    }

                    const banEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                        .setColor(configuration.embedColor)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser.user.tag}** has been permanently banned (Warns **${warns}**)`, embeds: [banEmbed] })
                    if (configuration.dmOnPunish == true) {
                        const youWereWarned = new MessageEmbed()
                            .setAuthor({ name: "You have been banned from " + interaction.guild?.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(guildSettings.color)
                            .setDescription("You were banned from " + interaction.guild?.name + ` 
                            
                            **__Details:__** ${reason}
                            > **Duration:** Permanent
                            > **Date:** <t:${Math.round(Date.now() / 1000)}:D>
                            > **Case:** ${caseNumberSet}
                            > **Current Warns:** ${warns}`)
                            .setTimestamp()
                        banUser.send({ embeds: [youWereWarned] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        })
                    }

                    banUser.ban({ reason: reason, days: 0 }).catch((err: Error) => { console.error(err + " This error was not caught by WOKCommands") })

                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Banned - ${banUser.user.tag}`, iconURL: banUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser.user.tag}\n> [${banUser.user.id}]\n> [<@${interaction.user.id}>]\n<:folder:977391492790362173> **Mod:** ${interaction.user.tag}\n> [${interaction.user.id}]\n> [<@${interaction.user.id}>]\n<:pencil:977391492916207636> **Action:** Ban\n> [Case #${caseNumberSet}]\n**Reason:** ${reason}\n**Channel:** <#${interaction.channel?.id}>\n**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }

                }
            }
            return true;
        }
        function endsWithAny(suffixes: any, string: any) {
            return suffixes.some(function (suffix: any) {
                return string.endsWith(suffix);
            });
        }
    }
} as ICommand