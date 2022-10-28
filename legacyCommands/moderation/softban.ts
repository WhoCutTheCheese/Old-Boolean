import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, time } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";
import Cases from "../../models/cases";

module.exports = {
    commands: ['softban', 'sb'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Delete Dats) (Reason)",
    commandName: "BAN",
    commandCategory: "MODERATION",
    cooldown: 2,
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.BanMembers])) return message.channel.send({ content: "I require the `Ban Members` to ban users!" });

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!member) return message.channel.send({ content: "I was unable to find that member!" })

        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(member.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (message.author.id !== message.guild?.ownerId) {
            if (thePermit?.bypassBan == true) return message.channel.send({ content: "You cannot ban this member!" });
        }
        if (member) {
            if (message.guild.members.me.roles.highest.position < member.roles.highest.position) return message.channel.send({ content: "This member is above me! I cannot ban them." })
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

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const warns = await Cases.countDocuments({ userID: member.id, caseType: "Warn" })

        if (!isNaN(Number(args[1]))) {

            let reason = "No reason provided."
            if (args[2]) reason = args.slice(2).join(" ");
            if(reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length! (250 Characters)" })

            if (Number(args[1]) > 7) return message.channel.send({ content: "You cannot delete messages past 7 days." })

            const newCase = new Cases({
                guildID: message.guild.id,
                userID: member.id,
                modID: message.author.id,
                caseType: "Soft-Ban",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "None",
                caseDate: Date.now(),
            })
            newCase.save().catch((err: Error) => console.error(err));

            const userBannedWithTime = new EmbedBuilder()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
                .setColor(color)
            message.channel.send({ content: `<:arrow_right:967329549912248341> **${member.user.tag}** has been soft-banned! (Warns **${warns}**)`, embeds: [userBannedWithTime] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Banned - ${member.user.tag}`, iconURL: member.displayAvatarURL() || undefined })
                .setThumbnail(member.displayAvatarURL() || null)
                .setDescription(`<:member:977391493218181120> **User:** ${member.user.tag}
                > [${member.id}]
                > [<@${member.id}>]

                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Soft-Ban
                > [**Case:** #${caseNumberSet}]

                **Reason:** ${reason}
                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }

            if (settings.modSettings?.dmOnPunish == true) {
                const dm = new EmbedBuilder()
                    .setAuthor({ name: "You Were Banned From " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                    <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                    .setTimestamp()
                if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                    member.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
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
                    member.send({ embeds: [dm] }).catch((err: Error) => {
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
            member.ban({ reason: reason, deleteMessageDays: Number(args[1]) }).catch((err: Error) => console.error(err)).then(() => {
                message.guild?.members.unban(member.id, "Soft-Ban").catch((err: Error) => console.error(err))
            })
            return;

        }

        let reason = "No reason provided."
        if (args[1]) reason = args.slice(1).join(" ");
        if(reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length! (250 Characters)" })

        const newCase = new Cases({
            guildID: message.guild.id,
            userID: member.id,
            modID: message.author.id,
            caseType: "Soft-Ban",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "None",
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));

        const userBannedWithTime = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag} | **Reason:** ${reason}`)
            .setColor(color)
        message.channel.send({ content: `<:arrow_right:967329549912248341> **${member.user.tag}** has been soft-banned! (Warns **${warns}**)`, embeds: [userBannedWithTime] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Banned - ${member.user.tag}`, iconURL: member.displayAvatarURL() || undefined })
            .setThumbnail(member.displayAvatarURL() || null)
            .setDescription(`<:member:977391493218181120> **User:** ${member.user.tag}
        > [${member.id}]
        > [<@${member.id}>]

        <:folder:977391492790362173> **Mod:** ${message.author.tag}
        > [${message.author.id}]
        > [<@${message.author.id}>]

        <:pencil:977391492916207636> **Action:** Soft-Ban
        > [**Case:** #${caseNumberSet}]

        **Reason:** ${reason}
        **Channel:** <#${message.channel?.id}>
        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

        if (settings.modSettings?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You Were Banned From " + message.guild.name + "!", iconURL: message.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
            <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                .setTimestamp()
            if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                member.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
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
                member.send({ embeds: [dm] }).catch((err: Error) => {
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
        member.ban({ reason: reason, deleteMessageDays: 7 }).catch((err: Error) => console.error(err)).then(() => {
            message.guild?.members.unban(member.id, "Soft-Ban").catch((err: Error) => console.error(err))
        })


    }
}
