import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, InteractionCollector, Message, PermissionsBitField, TextChannel } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
const ms = require("ms");

module.exports = {
    commands: ["mute", "silence", "m"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Length) (Reason)",
    commandName: "MUTE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageRoles])) return message.channel.send({ content: "I require the `Timeout Members` and `Manage Roles` to issue mutes!" });

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

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot mute yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot mute this user!" })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(message.author.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("MUTE")) return message.channel.send({ content: "You cannot mute this user!" });

        if(message.guild.members.me.roles.highest.position < user.roles.highest.position) return message.channel.send({ content: "This user is above me! I cannot mute them." })

        const caseNumberSet = guildProp?.totalCases! + 1;

        await GuildProperties.findOneAndUpdate({
            guildID: message.guild?.id
        }, {
            totalCases: caseNumberSet,
        })

        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })

        //temp mute

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

                    if (ms(`${time}${type1}`) >= 2332800) return message.channel.send({ content: "Length exceed maximum time." })

                    const userMutedWithTimeEmbed = new EmbedBuilder()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} | **Length**: ${time} ${type}`)
                        .setColor(color)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been muted! (Warns **${warns}**)`, embeds: [userMutedWithTimeEmbed] })

                    const modLogs = new EmbedBuilder()
                        .setAuthor({ name: `Member Muted - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                        .setThumbnail(user.displayAvatarURL() || null)
                        .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
                        > [${user.id}]
                        > [<@${user.id}>]
        
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
        
                        <:pencil:977391492916207636> **Action:** Mute
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
                            .setAuthor({ name: "You Were Muted in " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
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
                        caseType: "Mute",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: time + " " + type,
                        caseDate: Date.now(),
                    })
                    newCase.save().catch((err: Error) => console.error(err));
                    user.timeout(ms(`${time}${type1}`, reason)).catch((err: Error) => console.log(err))
                    return;
                }
            }
        }

        //perma mute
        if(configuration?.muteRoleID == "None") return message.channel.send({ content: "There is no mute role!" })
        let reason = args.splice(1).join(" ")
        if (!reason) reason = "No reason provided."
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum lenth. (250 Characters)" })

        user?.roles.add(configuration?.muteRoleID!).catch((err: Error) => {
            message.channel.send({ content: "I was unable to assign a role to this user!" })
            console.error(err)
            return;
        });

        const newCase = new Cases({
            guildID: message.guild.id,
            userID: user.id,
            modID: message.author.id,
            caseType: "Mute",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "Permanent",
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));

        const userMutedEmbed = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason} | **Length**: Permanent`)
            .setColor(color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been muted! (Warns **${warns}**)`, embeds: [userMutedEmbed] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Muted - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Mute
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
                .setAuthor({ name: "You Were Muted in " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
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
        }

    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}