import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick users from your guild.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("User you would like to kick.")
        )
        .addStringOption(reason =>
            reason.setName("reason")
                .setRequired(false)
                .setDescription("Reason for kick.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

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
        if (thePermit?.commandAccess.includes("KICK") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("KICK") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: "I do not have permission to kick members!", ephemeral: true })

        let user = interaction.options.getUser("user")
        if (!user) return interaction.reply({ content: "Invalid user! How?", ephemeral: true })

        let reason = interaction.options.getString("reason")
        if (!reason) reason = "No reason provided."
        if (reason.length > 200) return interaction.reply({ content: "Reason exceeds maximum length. (250 Characters)", ephemeral: true })

        if (user.id === interaction.user.id) return interaction.reply({ content: "you cannot kick yourself.", ephemeral: true })
        if(user?.id === client.user?.id) return interaction.reply({ content: "I cannot kick myself.", ephemeral: true })


        let member = interaction.guild.members.cache.get(user.id)
        if (!member) return interaction.reply({ content: "You cannot kick a user not in the guild.", ephemeral: true })

        if (interaction.user.id !== interaction.guild.ownerId) {
            if (member.roles.highest >= interaction.guild.roles.highest) return interaction.reply({ content: "You cannot kick users above you!", ephemeral: true })
        }

        if (user.id === interaction.guild.ownerId) return interaction.reply({ content: "You cannot kick this user!", ephemeral: true })
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

        const banned = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
            .setColor(color)
        interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.tag}** has been kicked! (Warns **${warns}**)`, embeds: [banned] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Kicked - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Kick
            > [**Case:** #${caseNumberSet}]

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


        if (settings.modSettings?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You Were Kicked from " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
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


        const newCase = new Cases({
            guildID: interaction.guild.id,
            userID: user.id,
            modID: interaction.user.id,
            caseType: "Kick",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "None",
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));
        member.kick(reason)
    }
}