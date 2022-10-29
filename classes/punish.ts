import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, GuildMember, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Cases from "../models/cases";
import Bans from "../models/bans";

export class Punishment {


    constructor(someArg: {
        type: string,
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
        if(time != "none") caseTime = timeFormatted;
        let timeArg = ""
        let dmTimeArg = ""
        let timeResponseArg = ""
        if (time) {
            timeArg = `> [**Length:** ${timeFormatted}]\n`
            dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
            timeResponseArg = " | **Length:** " + timeFormatted
        } else {
            if(type == "ban" || type == "mute") {
                timeFormatted = "Permanent"                
                timeArg = `> [**Length:** ${timeFormatted}]\n`
                dmTimeArg = `\n<:blurple_bulletpoint:997346294253244529> **Length:** ${timeFormatted}`
                timeResponseArg = " | **Length:** " + timeFormatted
            }

        }
        let plurals: string = "Error"
        if (type.toLowerCase() == "warn") plurals = "warned"
        if (type.toLowerCase() == "kick") plurals = "kicked"
        if (type.toLowerCase() == "mute") plurals = "muted"
        if (type.toLowerCase() == "ban") plurals = "banned"

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

            <:pencil:977391492916207636> **Action:** ${type.toUpperCase()}
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

        switch (type.toLowerCase()) {

            case "kick":

                member?.kick(reason).catch((err: Error) => console.error(err));

                break;
            case "ban":
                if(time || time != "none") {
                    
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

                }

        }

    }
}

