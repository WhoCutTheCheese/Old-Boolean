import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import settings from "../models/settings";
import { ModLogTypes } from "./types/types";

export class ModLogs {

    constructor(someArgs: {
        type: ModLogTypes,
        time?: Date | string,
        timeFormatted?: string,
        message: Message,
        user: User,
        mod?: User,
        caseNumber?: number,
        settings: any,
        reason: string,
        oldNick?: string,
        newNick?: string,
        oldReason?: string,
        newReason?: string,
        purgeAmount?: number,
        deleteDays?: number,
    }) {

        let { type, time, timeFormatted, message, user, reason, mod, caseNumber, oldNick, newNick, oldReason, newReason, purgeAmount, deleteDays, settings } = someArgs

        let color = settings.guildSettings.embedColor;
        if (!color) color = "5865F2";

        if (type == 1 || type == 2 || type == 3 || type == 4 || type == 5) {
            if (!timeFormatted) timeFormatted = "Permanent"
            if (!reason) reason = "No reason provided."
            let caseTime: string = ""
            if (time) caseTime = timeFormatted
            let timeArg = ""
            if (time) {
                timeArg = `> [**Length:** ${timeFormatted}]\n`
            } else if (!time) {
                if (type == 1 || type == 3) {
                    timeArg = `> [**Length:** ${timeFormatted}]\n`
                }
            }

            let plurals = "Error"
            let punishment = "Error"
            let deleteDaysArg = ""
            let deleteDaysModLogArg = ""
            if (type == 1) plurals = "banned"; punishment = "BAN"
            if (type == 2) plurals = "kicked"; punishment = "KICK"
            if (type == 3) plurals = "muted";; punishment = "MUTE"
            if (type == 4) plurals = "warned"; punishment = "WARN"
            if (type == 5) plurals = "soft banned"; punishment = "SOFT BAN"; deleteDaysArg = ` | **Delete Days:** ${deleteDays} day(s)`; deleteDaysModLogArg = `> [**Delete Days:** ${deleteDays} day(s)]\n`

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
                > [**Case:** #${caseNumber}]
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
                    (message.guild?.channels.cache.find((c: any) => c.id === modLogChannel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }

        }

    }

}