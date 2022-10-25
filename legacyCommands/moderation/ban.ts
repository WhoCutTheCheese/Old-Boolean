import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, InteractionCollector, Message, PermissionsBitField, TextChannel } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
import Bans from "../../models/bans";
const ms = require("ms");

module.exports = {
    commands: ["ban", "thanosnap", "b", "bean"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Length) (Reason)",
    commandName: "BAN",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([ PermissionsBitField.Flags.BanMembers ])) return message.channel.send({ content: "I require the `Ban Members` to ban users!" });

        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id
        })

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid User!" })

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot ban yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot ban this user!" })
        if (user.id === client.user?.id) return message.channel.send({ content: "You cannot ban me. My power levels are too high!" })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("BAN") || thePermit?.commandAccess.includes("MODERATION")) return message.channel.send({ content: "You cannot ban this user!" });

        if(message.guild.members.me.roles.highest.position < user.roles.highest.position) return message.channel.send({ content: "This user is above me! I cannot ban them." })

        const caseNumberSet = guildProp?.totalCases! + 1;

        await GuildProperties.findOneAndUpdate({
            guildID: message.guild?.id
        }, {
            totalCases: caseNumberSet,
        })

        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })

        //temp ban

        if (/^\d/.test(args[1])) {
            if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {

                const time = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "")
                if (!isNaN(Number(time))) {

                    let reason = args.splice(2).join(" ")
                    if (!reason) reason = "No reason provided."
                    if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length. (250 Characters)" })

                    let type1: any
                    if (args[1].endsWith("s")) {
                        type1 = "s"
                    } else if (args[1].endsWith("m")) {
                        type1 = "m"
                    } else if (args[1].endsWith("h")) {
                        type1 = "h"
                    } else if (args[1].endsWith("d")) {
                        type1 = "d"
                    } else if (args[1].endsWith("w")) {
                        type1 = "w"
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

                    let length: number;
                    if (type === "second(s)") {
                        length = parseInt(time);
                    } else if (type === "minute(s)") {
                        length = parseInt(time) * 60
                    } else if (type === "hour(s)") {
                        length = parseInt(time) * 60 * 60
                    } else if (type === "day(s)") {
                        length = parseInt(time) * 60 * 60 * 24
                    } else if (type === "week(s)") {
                        length = parseInt(time) * 60 * 60 * 24 * 7
                    }

                    const expires = new Date()

                    expires.setSeconds(expires.getSeconds() + length!)

                    const banExpire = new Bans({
                        guildID: message.guild.id,
                        userID: user.id,
                        caseNumber: 0,
                        caseEndDate: expires,
                    })
                    banExpire.save()

                    const userBannedWithTime = new EmbedBuilder()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} | **Length**: ${time} ${type}`)
                        .setColor(color)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been banned! (Warns **${warns}**)`, embeds: [userBannedWithTime] })

                    const modLogs = new EmbedBuilder()
                        .setAuthor({ name: `Member Banned - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                        .setThumbnail(user.displayAvatarURL() || null)
                        .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
                        > [${user.id}]
                        > [<@${user.id}>]
        
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
        
                        <:pencil:977391492916207636> **Action:** Ban
                        > [**Case:** #${caseNumberSet}]
                        > [**Length:**] ${time} ${type}
        
                        **Reason:** ${reason}
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        .setColor(color)
                        .setTimestamp()
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
                    if (!channel) { return; }
                    if (message.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                        (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                    }

                    if (configuration?.dmOnPunish == true) {
                        const dm = new EmbedBuilder()
                            .setAuthor({ name: "You Were Banned From " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
                            .setColor(color)
                            .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                            <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                            <:blurple_bulletpoint:997346294253244529> **Length:** ${time} ${type}`)
                            .setTimestamp()
                        if (guildProp?.premium == false) {
                            user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        } else if (guildProp?.premium == true) {
                            user.send({ embeds: [dm] }).catch((err: Error) => {
                                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                if (!channel) { return; }
                                if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            })
                        }
                    }
                    const newCase = new Cases({
                        guildID: message.guild.id,
                        userID: user.id,
                        modID: message.author.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: time + " " + type,
                        caseDate: Date.now(),
                    })
                    newCase.save().catch((err: Error) => console.error(err));
                    message.guild.members.ban(user.id);
                    return;
                }
            }
        }

        //perma ban
        let reason = args.splice(1).join(" ")
        if (!reason) reason = "No reason provided."
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum lenth. (250 Characters)" })

        const newCase = new Cases({
            guildID: message.guild.id,
            userID: user.id,
            modID: message.author.id,
            caseType: "Ban",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "Permanent",
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));

        const userPermaBannedEmbed = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} | **Length**: Permanent`)
            .setColor(color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been banned! (Warns **${warns}**)`, embeds: [userPermaBannedEmbed] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Banned - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Ban
            > [**Case:** #${caseNumberSet}]
            > [**Length:**] Permanent

            **Reason:** ${reason}
            **Channel:** <#${message.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!channel) { return; }
        if (message.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
        }

        if (configuration?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You Were Bann From " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                <:blurple_bulletpoint:997346294253244529> **Length:** Permanent`)
                .setTimestamp()
            if (guildProp?.premium == false) {
                user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                    }
                })
            } else if (guildProp?.premium == true) {
                user.send({ embeds: [dm] }).catch((err: Error) => {
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                    }
                })
            }
            message.guild.members.ban(user.id)
        }

    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}