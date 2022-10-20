import { Client, Message, EmbedBuilder, PermissionsBitField, TextChannel, ColorResolvable } from "discord.js";
import automodConfig from "../models/automodConfig";
import Guild from "../models/guild";
import Config from "../models/config";
import Cases from "../models/cases";
import Permits from "../models/permits";
const ms = require("ms");
const badlinks = require("../json/badlinks.json")

export default async function performAutomod(message: Message, client: Client) {
    const automodConfiguration = await automodConfig.findOne({
        guildID: message.guild?.id,
    })
    const guildProp = await Guild.findOne({
        guildID: message.guild?.id,
    })
    const configuration = await Config.findOne({
        guildID: message.guild?.id,
    })

    const permits = await Permits.find({
        guildID: message.guild?.id
    })


    if (!automodConfiguration) { return; }
    if (!configuration) { return; }
    if (!guildProp) { return; }
    const color = configuration.embedColor as ColorResolvable;
    const warns = await Cases.countDocuments({
        guildID: message.guild?.id,
        userID: message.author.id,
        caseType: "Warn",
    })
    if (message.webhookId) { return; }

    if(!message.guild?.members.me?.permissions.has([ PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages ])) return;

    const roles = message.member?.roles.cache.map((r) => r);

    let hasRole: boolean = false
    let ObjectID: any
    if(roles) {
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
    
        if(thePermit?.autoModBypass == true) return;
    
    }


    const caseNumberSet = guildProp.totalCases! + 1;
    if (automodConfiguration.blockLinks == true) {
        let getGoodContent = message.content
        for (const websites of automodConfiguration.websiteWhitelist) {
            if (message.content.includes(websites)) {
                getGoodContent = message.content.replace(`${websites}`, "")
                break;
            }

        }
        if (/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(getGoodContent)) {
            if (message.deletable) {
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute!
                }
                if (remainder == 0) {
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
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if (message.guild?.members.me?.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                    const warnEmbed = new EmbedBuilder()
                        .setDescription(`**Reason:** Sending unauthorized links.`)
                        .setColor(color)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete()
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
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                if (!channel) { return; }
                if (message.guild?.members.me?.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
                const warnEmbed = new EmbedBuilder()
                    .setDescription(`**Reason:** Sending a link to an unauthorized website.`)
                    .setColor(color)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete()
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }

    //Scam Blocker
    if (automodConfiguration.blockScams === true) {
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
            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
            if (!channel) { return; }
            if (message.guild?.members.me?.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
            }
            const warnEmbed = new EmbedBuilder()
                .setDescription(`**Reason:** Sending scan links.`)
                .setColor(color)
            return message.channel.send({ content: `<:arrow_right:967329549912248341> ${message.author.tag} has been banned.`, embeds: [warnEmbed] }).then(msg => {
                setTimeout(() => {
                    if (msg.deletable) {
                        msg.delete()
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
    if (automodConfiguration.massMentions == true) {
        if (message.mentions.members!.size > automodConfiguration.maxMentions!) {
            if (message.deletable) {
                let remainder
                if (warns !== 0) {
                    remainder = warns % configuration.warnsBeforeMute!
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
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if (message.guild?.members.me?.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }

                    const warnEmbed = new EmbedBuilder()
                        .setDescription(`**Reason:** Exceeding max mentions.`)
                        .setColor(color)
                    return message.reply({ content: "<:arrow_right:967329549912248341> You have been automatically muted.", embeds: [warnEmbed] }).then(msg => {
                        setTimeout(() => {
                            if (msg.deletable) {
                                msg.delete()
                            }
                        }, 10000)
                        message.delete().catch((err: Error) => console.error(err));
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
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                if (!channel) { return; }
                if (message.guild?.members.me?.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
                const warnEmbed = new EmbedBuilder()
                    .setDescription(`**Reason:** Exceeding max mentions.`)
                    .setColor(color)
                return message.reply({ content: "<:arrow_right:967329549912248341> You have been warned.", embeds: [warnEmbed] }).then(msg => {
                    setTimeout(() => {
                        if (msg.deletable) {
                            msg.delete()
                        }
                    }, 10000)
                    message.delete().catch((err: Error) => console.error(err));
                })
            }
        }
    }
}