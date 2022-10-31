import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, GuildMember, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import { PunishTypes } from "./types/types";
import Cases from "../models/cases";
import Bans from "../models/bans";
import { ModLogs } from "./log";
const ms = require("ms");

export class Punishment {

    constructor(someArg: {
        type: PunishTypes,
        time?: string | Date,
        timeFormatted?: string,
        user: User,
        member?: GuildMember,
        message: Message,
        settings: any,
        color: ColorResolvable,
        caseNumberSet: number,
        reason: string,
        warns: number,
        remainder?: number,
        deleteDays?: number,
    }) {

        let { type, time, timeFormatted, user, member, message, settings, color, caseNumberSet, reason, warns, remainder, deleteDays } = someArg;

        let caseTime: string | undefined = "None"
        if (time != "none" || time) caseTime = timeFormatted;
        if (!timeFormatted) timeFormatted = "Permanent"
        let timeArg = ""
        let dmTimeArg = ""
        let timeResponseArg = ""
        if (time || time != "none") {
            if (type == 1 || type == 3) {
                timeArg = `> [**Length:** ${timeFormatted}]\n`
                dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
                timeResponseArg = " | **Length:** " + timeFormatted
            }
        } else if (!time || time == "none") {
            if (type == 1 || type == 3) {
                timeFormatted = "Permanent"
                timeArg = `> [**Length:** ${timeFormatted}]\n`
                dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
                timeResponseArg = " | **Length:** " + timeFormatted
            }

        }
        if (!caseTime) caseTime = "Permanent"
        let plurals = "Error"
        let punishment = "Error"
        let deleteDaysArg = ""
        let deleteDaysModLogArg = ""
        if (type == 1) plurals = "banned"; punishment = "BAN"
        if (type == 2) plurals = "kicked"; punishment = "KICK"
        if (type == 3) plurals = "muted";; punishment = "MUTE"
        if (type == 4) plurals = "warned"; punishment = "WARN"
        if (type == 5) {
            plurals = "soft banned";
            punishment = "SOFT BAN";
            deleteDaysArg = ` | **Delete Days:** ${deleteDays} day(s)`;
            deleteDaysModLogArg = `> [**Delete Days:** ${deleteDays} day(s)]\n`
        }

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )
        if (type != 4) {
            const newCase = new Cases({
                guildID: message.guild?.id,
                userID: user.id,
                modID: message.author.id,
                caseType: punishment,
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: caseTime,
                caseDate: Date.now(),
            })
            newCase.save().catch((err: Error) => console.error(err));

            const userKickedEmbed = new EmbedBuilder()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}${timeResponseArg}${deleteDaysArg}`)
                .setColor(color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.tag}** has been ${plurals}! (Warns **${warns}**)`, embeds: [userKickedEmbed] })

            if (settings.modSettings?.dmOnPunish == true) {
                const dm = new EmbedBuilder()
                    .setAuthor({ name: `You have been ${plurals} from ` + message.guild?.name + "!", iconURL: message.guild?.iconURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                    <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}${dmTimeArg}`)
                    .setTimestamp()
                if (!settings.guildSettings?.prefix || settings.guildSettings?.premium == false) {
                    user.send({ embeds: [dm], components: [row] }).catch((err: Error) => console.error(err))
                } else if (settings.guildSettings?.premium == true) {
                    user.send({ embeds: [dm] }).catch((err: Error) => console.error(err))
                }
            }

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member ${plurals} - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** ${punishment}
                > [**Case:** #${caseNumberSet}]
                ${timeArg}
                ${deleteDaysModLogArg}
                **Reason:** ${reason}
                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const modLogChannel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!modLogChannel) { exists = false; }
            if (exists == true) {
                if (message.guild?.members.me?.permissionsIn(modLogChannel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild?.channels.cache.find((c: any) => c.id === modLogChannel?.id) as TextChannel).send({ embeds: [modLogs] }).catch((err: Error) => console.error(err))
                }
            }


        }

        switch (type) {
            case 1:
                if (time || time != "none") {

                    const banExpire = new Bans({
                        guildID: message.guild?.id,
                        userID: user.id,
                        caseNumber: 0,
                        caseEndDate: time,
                    })
                    banExpire.save()

                    message.guild?.members.ban(user.id).catch((err: Error) => {
                        console.error(err)
                        message.channel.send({ content: "I could not ban this user!" })
                    });
                    return;
                }

                message.guild?.members.ban(user.id).catch((err: Error) => {
                    console.error(err)
                    message.channel.send({ content: "I could not ban this user!" })
                });

                break;
            case 2:
                if (!member) throw new Error("Class Punishment: Member Not Found!")
                member?.kick(reason).catch((err: Error) => console.error(err));

                break;
            case 3:
                if (!member) throw new Error("Class Punishment: Member Not Found!")
                if (time) {

                    member.timeout(ms(`${time}`, reason)).catch((err: Error) => {
                        console.error(err)
                        message.channel.send({ content: "I could not mute this user!" })
                    });
                    return;
                } else if (!time) {
                    member.roles.add(settings.modSettings?.muteRole).catch((err: Error) => {
                        message.channel.send({ content: "An error occurred, if this persists please report it!" })
                        console.error(err)
                    });
                }
                break;
            case 4:
                //console.log(remainder)
                if (!member) throw new Error("Class Punishment: Member Not Found!")
                if (remainder == undefined || remainder == null) throw new Error("Class Punishment: Remainder Not Found!")
                if (remainder == 0) {
                    if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers])) return message.channel.send({ content: "I require the `Timeout Members` permission!" })
                    const newCase = new Cases({
                        guildID: message.guild?.id,
                        userID: user.id,
                        modID: message.author.id,
                        caseType: "Warn",
                        caseReason: reason + " Automatic mute due to excess warnings!",
                        caseNumber: caseNumberSet,
                        caseLength: "10 Minutes",
                        caseDate: Date.now(),
                    })
                    newCase.save().catch((err: Error) => console.error(err));

                    if (settings.modSettings?.dmOnPunish == true) {
                        const dm = new EmbedBuilder()
                            .setAuthor({ name: "You Were Muted in " + message.guild?.name + "!", iconURL: message.guild?.iconURL() || undefined })
                            .setColor(color)
                            .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason} Automatic mute due to excess warnings!
                            <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                            .setTimestamp()
                        if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                            user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                                console.error(err)
                            })
                        } else if (settings.guildSettings?.premium == true) {
                            user.send({ embeds: [dm] }).catch((err: Error) => {
                                console.error(err)
                            })
                        }
                    }

                    const warned = new EmbedBuilder()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                        .setColor(color)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.tag}** has been automatically muted! (Warns **${warns}**)`, embeds: [warned] })

                    const modLogs = new EmbedBuilder()
                        .setAuthor({ name: `Member Warned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                        .setThumbnail(user.displayAvatarURL() || null)
                        .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                        > [${user.id}]
                        > [<@${user.id}>]

                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]

                        <:pencil:977391492916207636> **Action:** Warn
                        > [**Case:** #${caseNumberSet}]

                        **Reason:** ${reason} Automatic mute due to excess warnings!
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        .setColor(color)
                        .setTimestamp()
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                        }
                    }
                    if (message.guild.members.me.roles.highest.position < member.roles.highest.position) return message.channel.send({ content: "I cannot mute this user!" })
                    return member.timeout(ms("10m")).catch((err: Error) => {
                        console.error(err)
                        message.channel.send({ content: "I could not mute this user!" })
                    });
                }

                const newCase = new Cases({
                    guildID: message.guild?.id,
                    userID: user.id,
                    modID: message.author.id,
                    caseType: "Warn",
                    caseReason: reason,
                    caseNumber: caseNumberSet,
                    caseLength: "None",
                    caseDate: Date.now(),
                })
                newCase.save().catch((err: Error) => console.error(err));

                if (settings.modSettings?.dmOnPunish == true) {
                    const dm = new EmbedBuilder()
                        .setAuthor({ name: "You Were Warned in " + message.guild?.name + "!", iconURL: message.guild?.iconURL() || undefined })
                        .setColor(color)
                        .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                        <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                        .setTimestamp()
                    if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                        user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                            console.error(err)
                        })
                    } else if (settings.guildSettings?.premium == true) {
                        user.send({ embeds: [dm] }).catch((err: Error) => {
                            console.error(err)
                        })
                    }
                }

                const warned = new EmbedBuilder()
                    .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                    .setColor(color)
                message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.tag}** has been warned! (Warns **${warns}**)`, embeds: [warned] })

                const modLogs = new EmbedBuilder()
                    .setAuthor({ name: `Member Warned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                    .setThumbnail(user.displayAvatarURL() || null)
                    .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                    > [${user.id}]
                    > [<@${user.id}>]
        
                    <:folder:977391492790362173> **Mod:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
        
                    <:pencil:977391492916207636> **Action:** Warn
                    > [**Case:** #${caseNumberSet}]
        
                    **Reason:** ${reason}
                    **Channel:** <#${message.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    .setColor(color)
                    .setTimestamp()
                const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
                let exists = true
                if (!channel) { exists = false; }
                if (exists == true) {
                    if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                    }
                }

                break;
            case 5:

                if (deleteDays == null || deleteDays == undefined) throw new Error("Punishment Class: Invalid Delete Days!");

                member?.ban({ reason: reason, deleteMessageDays: deleteDays }).catch((err: Error) => console.error(err)).then(() => {
                    message.guild?.members.unban(member!.id, "Soft-Ban").catch((err: Error) => console.error(err))
                })

                break;

        }

    }
}



