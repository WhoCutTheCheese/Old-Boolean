import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, InteractionCollector, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
const ms = require("ms");

module.exports = {
    commands: ["warn", "w"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    commandName: "WARN",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
        
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

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot issue warnings to yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot issue warnings to this user!" })
        if (user.id === client.user?.id) return message.channel.send({ content: "You cannot warn me. My power levels are too high!" })

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
        if(message.author.id !== message.guild?.ownerId) {
            if (thePermit?.bypassWarn == true) return message.channel.send({ content: "You cannot warn this user!" });
        }
        let caseNumberSet: number = 10010100101
        if (!settings.guildSettings?.totalCases) {
            caseNumberSet = 1;
        } else if (settings.guildSettings?.totalCases) {
            caseNumberSet = settings.guildSettings?.totalCases + 1;
        }
        await Settings.findOneAndUpdate({
            guildID: message.guild?.id,
        }, {
            guildSettings: {
                totalCases: caseNumberSet
            }
        })

        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })
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
        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason provided!"
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length. (250 Characters)" })

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
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                        let exists = true
                        if (!channel) { exists = false; }
                        if (exists == true) {
                            if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        }
                    })
                } else if (settings.guildSettings?.premium == true) {
                    user.send({ embeds: [dm] }).catch((err: Error) => {
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                        let exists = true
                        if (!channel) { exists = false; }
                        if (exists == true) {
                            if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        }
                    })
                }
            }

            const warned = new EmbedBuilder()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been automatically muted! (Warns **${warns}**)`, embeds: [warned] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Warned - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
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
            if (message.guild.members.me.roles.highest.position < user.roles.highest.position) return message.channel.send({ content: "I cannot mute this user!" })
            return user.timeout(ms("10m")).catch((err: Error) => {
                console.error(err)
                message.channel.send({ content: "I could not mute this user!" })});

        }


        const newCase = new Cases({
            guildID: message.guild?.id,
            userID: user.id,
            modID: message.author.id,
            caseType: "Warn",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "10 Minutes",
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
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                        }
                    }
                })
            } else if (settings.guildSettings?.premium == true) {
                user.send({ embeds: [dm] }).catch((err: Error) => {
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                        }
                    }
                })
            }
        }

        const warned = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
            .setColor(color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${user.user.tag}** has been warned! (Warns **${warns}**)`, embeds: [warned] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Warned - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
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

    }
}