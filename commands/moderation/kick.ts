import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

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
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })
        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

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
        if (reason.length > 200) return interaction.reply({ content: "Reason exceeds maximum length. (200 Characters)", ephemeral: true })

        if (user.id === interaction.user.id) return interaction.reply({ content: "you cannot kick yourself.", ephemeral: true })

        let member = interaction.guild.members.cache.get(user.id)
        if(!member) return interaction.reply({ content: "You cannot kick a user not in the guild.", ephemeral: true })

        if (interaction.user.id !== interaction.guild.ownerId) {
            if (member.roles.highest >= interaction.guild.roles.highest) return interaction.reply({ content: "You cannot kick users above you!", ephemeral: true })
        }

        if (user.id === interaction.guild.ownerId) return interaction.reply({ content: "You cannot kick this user!", ephemeral: true })
        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })

        const caseNumberSet = guildProp?.totalCases! + 1;

        await GuildProperties.findOneAndUpdate({
            guildID: interaction.guild.id
        }, {
            totalCases: caseNumberSet,
        })

        const banned = new EmbedBuilder()
            .setDescription(`**Case:** ${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
            .setColor(color)
        interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been kicked! (Warns **${warns}**)`, embeds: [banned] })

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
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!channel) { return; }
        if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
        }


        if (configuration?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You Were Kicked from " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}`)
                .setTimestamp()
                if(guildProp?.premium == false) {
                    user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                        }
                    })
                } else if (guildProp?.premium == true) {
                    user.send({ embeds: [dm] }).catch((err: Error) => {
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
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