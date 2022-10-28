import { Client, Message, EmbedBuilder, PermissionsBitField, TextChannel, ColorResolvable, userMention } from "discord.js";
import Settings from "../models/settings";
import Cases from "../models/cases";
import Permits from "../models/permits";
const ms = require("ms");
const badlinks = require("../json/badlinks.json")

export default async function performAutomod(message: Message, client: Client) {
    if (!message.channel.isTextBased) return;
    if (message.author.bot) return;
    const settings = await Settings.findOne({
        guildID: message.guild?.id
    })
    if (!settings) return;

    let color: ColorResolvable = "5865F2" as ColorResolvable;
    if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

    const permits = await Permits.find({
        guildID: message.guild?.id
    })


    const warns = await Cases.countDocuments({
        guildID: message.guild?.id,
        userID: message.author.id,
        caseType: "Warn",
    })
    if (message.webhookId) { return; }

    if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages])) return;
    if (!(message.channel as TextChannel).permissionsFor(message.guild?.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages])) return;
    const roles = message.member?.roles.cache.map((r) => r);

    let hasRole: boolean = false
    let ObjectID: any
    if (roles) {
        for (const role of roles) {
            for (const permit of permits) {
                if (permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if (hasRole == true) break;
        }

        for (const permit of permits) {
            if (permit.users.includes(message.author.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })

        if (thePermit?.autoModBypass == true) return;

    }


    let caseNumberSet: number = 10010100101
    if (!settings.guildSettings?.totalCases) {
        caseNumberSet = 1;
    } else if (settings.guildSettings?.totalCases) {
        caseNumberSet = settings.guildSettings?.totalCases + 1;
    }

    if (settings.autoModSettings?.blockLinks == true) {
        let getGoodContent = message.content
        for (const websites of settings.autoModSettings?.websiteWhitelist) {
            if (message.content.includes(websites)) {
                getGoodContent = message.content.replace(`${websites}`, "")
                break;
            }

        }
        if (/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(getGoodContent)) {
            if (message.deletable) {
                if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
                if (!(message.channel as TextChannel).permissionsFor(message.guild.members.me)?.has(PermissionsBitField.Flags.ManageMessages)) return;
                let remainder
                let warnsBeforeMute = 3
                if (settings.modSettings?.warnsBeforeMute) warnsBeforeMute = settings.modSettings?.warnsBeforeMute
                if (warns != 0) {
                    if (warnsBeforeMute === 0) {
                        remainder = 1
                    } else {
                        remainder = warns % warnsBeforeMute!;
                    }
                }
                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    guildSettings: {
                        totalCases: caseNumberSet
                    }
                })
                if (remainder == 0) {
                    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: message.author.id,
                        modID: "------------------",
                        caseType: "Warn",
                        caseReason: "Sending unauthorized links. Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "None",
                        date: Date.now(),
                    })
                    newCases.save()
                    let messageA
                    if (message.content.length < 450) {
                        messageA = message.content
                    } else {
                        messageA = "Too long!"
                    }
                    const modLogEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Member Muted - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                        .setThumbnail(message.author.displayAvatarURL() || "")
                        .setColor(color)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Duration:** 10 Minutes]
                        > [**Message:** \`${messageA}\`]
                        **Reason:** Sending unauthorized links. Automatic mute due to excessive warnings.
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    }
                    const warnEmbed = new EmbedBuilder()
                        .setDescription(`**Reason:** Sending unauthorized links.`)
                        .setColor(color)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete().catch((err: Error) => console.error(err))
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
                        message.member?.timeout(ms("10m"), "Sending unauthorized links. Automatic mute due to excessive warnings.")
                    })
                }
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: message.author.id,
                    modID: "------------------",
                    caseType: "Warn",
                    caseReason: "Sending unauthorized links.",
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save()
                let messageA
                if (message.content.length < 450) {
                    messageA = message.content
                } else {
                    messageA = "Too long!"
                }
                const modLogEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Member Warned - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                    .setThumbnail(message.author.displayAvatarURL() || "")
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
                    <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                    <:pencil:977391492916207636> **Action:** Warn
                    > [**Case:** #${caseNumberSet}]
                    > [**Message:** \`${messageA}\`]
                    **Reason:** Sending unauthorized links.
                    **Channel:** <#${message.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                let exists = true
                if (!channel) { exists = false; }
                if (exists == true) {
                    if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }
                const warnEmbed = new EmbedBuilder()
                    .setDescription(`**Reason:** Sending a link to an unauthorized website.`)
                    .setColor(color)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete().catch((err: Error) => console.error(err));
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }

    //Scam Blocker
    if (settings.autoModSettings?.blockScams === true) {
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        if (!(message.channel as TextChannel).permissionsFor(message.guild.members.me)?.has(PermissionsBitField.Flags.ManageMessages)) return;
        let isScammer = false
        if (!message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) { return; }
        for (const scams of badlinks) {
            if (message.content.toLowerCase().includes(scams.toLowerCase())) {
                isScammer = true
                break;
            }
        }
        if (isScammer == true) {
            const newCases = await new Cases({
                guildID: message.guild?.id,
                userID: message.author.id,
                modID: "------------------",
                caseType: "Ban",
                caseReason: "Sending scam links.",
                caseNumber: caseNumberSet,
                caseLength: "Permanent",
                date: Date.now(),
            })
            newCases.save()

            await Settings.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                guildSettings: {
                    totalCases: caseNumberSet
                }
            })

            let messageA
            if (message.content.length < 450) {
                messageA = message.content
            } else {
                messageA = "Too long!"
            }
            const modLogEmbed = new EmbedBuilder()
                .setAuthor({ name: `Member Banned - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                .setThumbnail(message.author.displayAvatarURL() || "")
                .setColor(color)
                .setTimestamp()
                .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]
                <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                <:pencil:977391492916207636> **Action:** Ban
                > [**Case:** #${caseNumberSet}]
                > [**Duration:** Permanent]
                > [**Message:** \`${messageA}\`]
                **Reason:** Sending scam links.
                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            }
            const warnEmbed = new EmbedBuilder()
                .setDescription(`**Reason:** Sending scan links.`)
                .setColor(color)
            return message.channel.send({ content: `<:arrow_right:967329549912248341> ${message.author.tag} has been banned.`, embeds: [warnEmbed] }).then(msg => {
                setTimeout(() => {
                    if (msg.deletable) {
                        msg.delete().catch((err: Error) => console.error(err));
                    }
                }, 10000)
                message.delete().catch((err: Error) => console.error(err));
                if (message.member?.bannable) {
                    message.member?.ban({ reason: "Sending scam links", deleteMessageDays: 7 })
                }
            })
        }
    }

    //Mass Mentions
    if (settings.autoModSettings?.massMentions == true) {
        if (message.mentions.members!.size > settings.autoModSettings?.maxMentions!) {
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
            if (!(message.channel as TextChannel).permissionsFor(message.guild.members.me)?.has(PermissionsBitField.Flags.ManageMessages)) return;
            if (message.deletable) {
                let remainder
                let warnsBeforeMute = 3
                if (settings.modSettings?.warnsBeforeMute) warnsBeforeMute = settings.modSettings?.warnsBeforeMute
                if (warns != 0) {
                    if (warnsBeforeMute === 0) {
                        remainder = 1
                    } else {
                        remainder = warns % warnsBeforeMute!;
                    }
                }
                if (remainder == 0) {
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: message.author.id,
                        modID: "------------------",
                        caseType: "Warn",
                        caseReason: "Exceeding max mentions. Automatic mute due to excessive warnings.",
                        caseNumber: caseNumberSet,
                        caseLength: "None",
                        date: Date.now(),
                    })
                    newCases.save()
                    let messageA
                    if (message.content.length < 450) {
                        messageA = message.content
                    } else {
                        messageA = "Too long!"
                    }
                    const modLogEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Member Muted - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                        .setThumbnail(message.author.displayAvatarURL() || "")
                        .setColor(color)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Message:** \`${messageA}\`]
                        **Reason:** Exceeding max mentions. Automatic mute due to excessive warnings.
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                        message.member?.timeout(ms("10m"), "Exceeding max mentions. Automatic mute due to excessive warnings.")
                    }

                    const warnEmbed = new EmbedBuilder()
                        .setDescription(`**Reason:** Exceeding max mentions.`)
                        .setColor(color)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete().catch((err: Error) => console.error(err));
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
                        if (!message.guild?.members.me!.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;
                        message.member?.timeout(ms("10m"), "Exceeding max mentions. Automatic mute due to excessive warnings.")
                    })
                }
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: message.author.id,
                    modID: "------------------",
                    caseType: "Warn",
                    caseReason: "Exceeding max mentions.",
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    date: Date.now(),
                })
                newCases.save()
                let messageA
                if (message.content.length < 450) {
                    messageA = message.content
                } else {
                    messageA = "Too long!"
                }
                const modLogEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Member Warned - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                    .setThumbnail(message.author.displayAvatarURL() || "")
                    .setColor(color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
                    <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                    <:pencil:977391492916207636> **Action:** Warn
                    > [**Case:** #${caseNumberSet}]
                    > [**Message:** \`${messageA}\`]
                    **Reason:** Exceeding max mentions.
                    **Channel:** <#${message.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                let exists = true
                if (!channel) { exists = false; }
                if (exists == true) {
                    if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }
                const warnEmbed = new EmbedBuilder()
                    .setDescription(`**Reason:** Exceeding max mentions.`)
                    .setColor(color)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete().catch((err: Error) => console.error(err));
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }

    //invite blocking

    let invites = ["discord.gg/", "discord.com/invite", "discordapp.com/invite/"]
    if (settings.autoModSettings?.blockInvites == true) {
        for (const invite of invites) {

            if (message.content.includes(invite)) {
                if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
                if (!(message.channel as TextChannel).permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)) return;

                if (message.deletable) {
                    let remainder
                    let warnsBeforeMute = 3
                    if (settings.modSettings?.warnsBeforeMute) warnsBeforeMute = settings.modSettings?.warnsBeforeMute
                    if (warns != 0) {
                        if (warnsBeforeMute === 0) {
                            remainder = 1
                        } else {
                            remainder = warns % warnsBeforeMute!;
                        }
                    }
                    if (remainder == 0) {
                        const newCases = await new Cases({
                            guildID: message.guild?.id,
                            userID: message.author.id,
                            modID: "------------------",
                            caseType: "Warn",
                            caseReason: "Sending invite links. Automatic mute due to excessive warnings.",
                            caseNumber: caseNumberSet,
                            caseLength: "None",
                            date: Date.now(),
                        })
                        newCases.save()
                        let messageA
                        if (message.content.length < 450) {
                            messageA = message.content
                        } else {
                            messageA = "Too long!"
                        }
                        const modLogEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Member Muted - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                            .setThumbnail(message.author.displayAvatarURL() || "")
                            .setColor(color)
                            .setTimestamp()
                            .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Message:** \`${messageA}\`]
                        **Reason:** Sending invite links. Automatic mute due to excessive warnings.
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                        let exists = true
                        if (!channel) { exists = false; }
                        if (exists == true) {
                            if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                            }
                            message.member?.timeout(ms("10m"), "Sending invite links. Automatic mute due to excessive warnings.")
                        }

                        const warnEmbed = new EmbedBuilder()
                            .setDescription(`**Reason:** Sending invite links.`)
                            .setColor(color)
                        return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                            setTimeout(() => {
                                if (msg.deletable) {
                                    msg.delete().catch((err: Error) => console.error(err));
                                }
                            }, 10000)
                            message.delete().catch((err: Error) => console.error(err));
                            if (!message.guild?.members.me!.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;
                            message.member?.timeout(ms("10m"), "Sending invite links. Automatic mute due to excessive warnings.")
                        })
                    }
                    const newCases = await new Cases({
                        guildID: message.guild?.id,
                        userID: message.author.id,
                        modID: "------------------",
                        caseType: "Warn",
                        caseReason: "Sending invite links.",
                        caseNumber: caseNumberSet,
                        caseLength: "None",
                        date: Date.now(),
                    })
                    newCases.save()
                    let messageA
                    if (message.content.length < 450) {
                        messageA = message.content
                    } else {
                        messageA = "Too long!"
                    }
                    const modLogEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Member Warned - ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || "" })
                        .setThumbnail(message.author.displayAvatarURL() || "")
                        .setColor(color)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
                    <:folder:977391492790362173> **Mod:** \`AUTO-MOD\`
                    <:pencil:977391492916207636> **Action:** Warn
                    > [**Case:** #${caseNumberSet}]
                    > [**Message:** \`${messageA}\`]
                    **Reason:** Sending invite links.
                    **Channel:** <#${message.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has(PermissionsBitField.Flags.SendMessages)) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                        }
                    }
                    const warnEmbed = new EmbedBuilder()
                        .setDescription(`**Reason:** Sending invite links.`)
                        .setColor(color)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete().catch((err: Error) => console.error(err));
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
                    })
                }

            }

        }
    }

}