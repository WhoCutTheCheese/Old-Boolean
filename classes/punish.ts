import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, GuildMember, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Cases from "../models/cases";
import Bans from "../models/bans";
const ms = require("ms");

export enum PunishTypes {
    Ban = 1,
    Kick = 2,
    Mute = 3,
    Warn = 4,
    SoftBan = 5,
}

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
    }) {

        let { type, time, timeFormatted, user, member, message, settings, color, caseNumberSet, reason, warns } = someArg;


        if (!type) throw new Error("Class Punishment: Invalid Punishment Type")
        if (!user) throw new Error("Class Punishment: Invalid Punished User")
        if (!message) throw new Error("Class Punishment: Invalid Message Constructor")
        if (!settings) throw new Error("Class Punishment: Invalid Settings Document")
        if (!color) throw new Error("Class Punishment: Invalid Embed Color")
        if (!caseNumberSet) throw new Error("Class Punishment: Invalid Case Number")
        if (!reason) throw new Error("Class Punishment: Invalid Reason Provided")
        if (!warns) throw new Error("Class Punishment: Invalid Warns Number")

        let caseTime: string | undefined = "None"
        if (time != "none" || time) caseTime = timeFormatted;
        if (!timeFormatted) timeFormatted = "Permanent"
        let timeArg = ""
        let dmTimeArg = ""
        let timeResponseArg = ""
        if (time || time != "none") {
            timeArg = `> [**Length:** ${timeFormatted}]\n`
            dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
            timeResponseArg = " | **Length:** " + timeFormatted
        } else if (!time || time == "none") {
            if (type == 1 || type == 3) {
                timeFormatted = "Permanent"
                timeArg = `> [**Length:** ${timeFormatted}]\n`
                dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
                timeResponseArg = " | **Length:** " + timeFormatted
            }

        }
        if (!caseTime) caseTime = "Permanent"
        let plurals: string = "Error"
        let punishment : string = "Error"
        if (type == PunishTypes.Ban) plurals = "banned"; punishment = "BAN"
        if (type == 2) plurals = "kicked"; punishment = "KICK"
        if (type == 3) plurals = "muted";; punishment = "MUTE"
        if (type == 4) plurals = "warned"; punishment = "WARN"
        if(type == 5) plurals = "soft banned"; punishment = "SOFT BAN"

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const newCase = new Cases({
            guildID: message.guild?.id,
            userID: user.id,
            modID: message.author.id,
            caseType: type,
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: caseTime,
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));

        const userKickedEmbed = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}${timeResponseArg}`)
            .setColor(color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.tag}** has been ${plurals}! (Warns **${warns}**)`, embeds: [userKickedEmbed] })

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
                (message.guild?.channels.cache.find((c: any) => c.id === modLogChannel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

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

        switch (type) {

            case 2:

                member?.kick(reason).catch((err: Error) => console.error(err));

                break;
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
            case 3:
                if (time) {

                    member?.timeout(ms(`${time}`, reason)).catch((err: Error) => {
                        console.error(err)
                        message.channel.send({ content: "I could not mute this user!" })
                    });
                    return;
                } else if (!time) {
                    console.log("F")
                    member?.roles.add(settings.modSettings?.muteRole).catch((err: Error) => {
                        message.channel.send({ content: "An error occurred, if this persists please report it!" })
                        console.error(err)
                    });
                }


                break;

        }

    }
}



