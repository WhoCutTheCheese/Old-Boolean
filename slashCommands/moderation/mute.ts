import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
const ms = require("ms")
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute members in your guild.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("User you would like to mute.")
        )
        .addStringOption(reason =>
            reason.setName("reason")
                .setRequired(false)
                .setDescription("Reason for mute.")
                .setMaxLength(250)
        )
        .addStringOption(time =>
            time.setName("time")
                .setRequired(false)
                .setDescription("Time for mute")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

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
            if (permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("MUTE") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("MUTE") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ModerateMembers])) return interaction.reply({ content: "I do not have permission to mute members!", ephemeral: true })

        let user = interaction.options.getUser("user")
        if (!user) return interaction.reply({ content: "Invalid user! How?", ephemeral: true })

        let reason = interaction.options.getString("reason")
        if (!reason) reason = "No reason provided."
        if (reason.length > 200) return interaction.reply({ content: "Reason exceeds maximum length. (200 Characters)" })

        const time = interaction.options.getString("time")

        if (user.id === interaction.user.id) return interaction.reply({ content: "You cannot mute yourself.", ephemeral: true })

        let member = interaction.guild.members.cache.get(user.id)
        if (!member) return interaction.reply({ content: "User not in the guild!", ephemeral: true })
        if(user?.id === client.user?.id) return interaction.reply({ content: "I cannot mute myself.", ephemeral: true })
        if(member?.id === client.user?.id) return interaction.reply({ content: "I cannot mute myself.", ephemeral: true })
        if (member) {

                if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) return interaction.reply({ content: "You cannot mute users above you!", ephemeral: true })

        }

        if (user.id === interaction.guild.ownerId) return interaction.reply({ content: "You cannot mute this user!", ephemeral: true })
        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })

        let caseNumberSet: number = 10010100101
        if (!settings.guildSettings?.totalCases) {
            caseNumberSet = 1;
        } else if (settings.guildSettings?.totalCases) {
            caseNumberSet = settings.guildSettings?.totalCases + 1;
        }
        await Settings.findOneAndUpdate({
            guildID: interaction.guild?.id,
        }, {
            guildSettings: {
                totalCases: caseNumberSet
            }
        })

        if (time) {
            if (/^\d/.test(time)) {
                if (endsWithAny(["s", "m", "h", "d", "w"], time)) {
                    let time1 = time.replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                    if (isNaN(Number(time1))) return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })


                    let type1: any
                    if (time.endsWith("s")) {
                        type1 = "s"
                    } else if (time.endsWith("m")) {
                        type1 = "m"
                    } else if (time.endsWith("h")) {
                        type1 = "h"
                    } else if (time.endsWith("d")) {
                        type1 = "d"
                    } else if (time.endsWith("w")) {
                        type1 = "w"
                    }
                    let type: any
                    if (time.endsWith("s")) {
                        type = "second(s)"
                    } else if (time.endsWith("m")) {
                        type = "minute(s)"
                    } else if (time.endsWith("h")) {
                        type = "hour(s)"
                    } else if (time.endsWith("d")) {
                        type = "day(s)"
                    } else if (time.endsWith("w")) {
                        type = "week(s)"
                    }

                    if (ms(`${time1}${type1}`) >= 2332800) return interaction.reply({ content: "Length exceed maximum time.", ephemeral: true })

                    const banned = new EmbedBuilder()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason} | **Length**: ${time1} ${type}`)
                        .setColor(color)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been muted! (Warns **${warns}**)`, embeds: [banned] })

                    const modLogs = new EmbedBuilder()
                        .setAuthor({ name: `Member Muted - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                        .setThumbnail(user.displayAvatarURL() || null)
                        .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                        > [${user.id}]
                        > [<@${user.id}>]
        
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
        
                        <:pencil:977391492916207636> **Action:** Mute
                        > [**Case:** #${caseNumberSet}]
                        > [**Length:**] ${time1} ${type}
        
                        **Reason:** ${reason}
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        .setColor(color)
                        .setTimestamp()
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
                    let exists = true
                    if (!channel) { exists = false; }
                    if (exists == true) {
                        if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                        }
                    }

                    if (member) {
                        if (settings.modSettings?.dmOnPunish == true) {
                            const dm = new EmbedBuilder()
                                .setAuthor({ name: "You Were Muted in " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                                .setColor(color)
                                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                                <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                                <:blurple_bulletpoint:997346294253244529> **Length:** ${time1} ${type}`)
                                .setTimestamp()
                            if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                                user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                                    let exists = true
                                    if (!channel) { exists = false; }
                                    if (exists == true) {
                                        if (interaction.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                        }
                                    }
                                })
                            } else if (settings.guildSettings?.premium == true) {
                                user.send({ embeds: [dm] }).catch((err: Error) => {
                                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                                    let exists = true
                                    if (!channel) { exists = false; }
                                    if (exists == true) {
                                        if (interaction.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                        }
                                    }
                                })
                            }
                        }
                    }

                    const newCase = new Cases({
                        guildID: interaction.guild.id,
                        userID: user.id,
                        modID: interaction.user.id,
                        caseType: "Mute",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: time1 + " " + type,
                        caseDate: Date.now(),
                    })
                    newCase.save().catch((err: Error) => console.error(err));
                    return member?.timeout(ms(`${time1}${type1}`), reason)

                } else {
                    return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })
                }
            } else {
                return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })
            }
        }

        if (!time) {
            if (!settings.modSettings?.muteRole) return interaction.reply({ content: "Mute role is not set!", ephemeral: true })
            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Muted - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Mute
                > [**Case:** #${caseNumberSet}]
                > [**Length:**] Permanent

                **Reason:** ${reason}
                **Channel:** <#${interaction.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }

            if (member) {
                if (settings.modSettings?.dmOnPunish == true) {
                    const dm = new EmbedBuilder()
                        .setAuthor({ name: "You Were Muted in " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                        .setColor(color)
                        .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                    <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                    <:blurple_bulletpoint:997346294253244529> **Length:** Permanent`)
                        .setTimestamp()
                    if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                        user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                            let exists = true
                            if (!channel) { exists = false; }
                            if (exists == true) {
                                if (interaction.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            }
                        })
                    } else if (settings.guildSettings?.premium == true) {
                        user.send({ embeds: [dm] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
                            let exists = true
                            if (!channel) { exists = false; }
                            if (exists == true) {
                                if (interaction.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                }
                            }
                        })
                    }
                }
            }

            const newCase = new Cases({
                guildID: interaction.guild.id,
                userID: user.id,
                modID: interaction.user.id,
                caseType: "Mute",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "Permanent",
                caseDate: Date.now(),
            })
            newCase.save().catch((err: Error) => console.error(err));
            if (interaction.guild.members.me.roles.highest.position < interaction.guild.roles.cache.get(settings.modSettings?.muteRole)?.position!) {
                return interaction.reply({ content: "I cannot give the mute role!", ephemeral: true })
            }
            member?.roles.add(settings.modSettings?.muteRole).catch((err: Error) => {
                interaction.reply({ content: "An error occurred, if this persists please report it!" })
                console.error(err)
            });
            const banned = new EmbedBuilder()
                .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason} | **Length**: Permanent`)
                .setColor(color)
            interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been muted! (Warns **${warns}**)`, embeds: [banned] })
        }

    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}