import { SlashCommandBuilder, Client, PermissionsBitField, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Issue a formal warning to a user.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("Select a user.")
        )
        .addStringOption(string =>
            string.setName("reason")
                .setRequired(false)
                .setDescription("Assign a reason for the warning.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id
        })

        const color = configuration?.embedColor as ColorResolvable;

        let reason = interaction.options.getString("reason")
        if (!reason) {
            reason = "No reason provided."
        }
        if (reason.length > 200) { return interaction.reply({ content: "Reason exceeds maximum length. (200 Characters)", ephemeral: true }) }

        let user = interaction.options.getUser("user")
        if (!user) { return interaction.reply({ content: "I don't know what kind of black magic you used, but that user is invalid.", ephemeral: true }) }

        if (user.id === interaction.user.id) { return interaction.reply({ content: "You cannot issue punishments to yourself!", ephemeral: true }) }

        if (user.bot) { return interaction.reply({ content: "You cannot issue warnings to a bot.", ephemeral: true }) }
        let member = interaction.guild.members.cache.get(user.id)
        if(member) {
            if(interaction.user.id !== interaction.guild.ownerId) {
                if(member.roles.highest >= interaction.guild.roles.highest) return interaction.reply({ content: "You cannot warn users above you!", ephemeral: true })
            }
        } else {
            return interaction.reply({ content: "Why are you warning a user who is not in this guild!", ephemeral: true })
        }

        const caseNumberSet = guildProp?.totalCases! + 1;

        await GuildProperties.findOneAndUpdate({
            guildID: interaction.guild.id
        }, {
            totalCases: caseNumberSet,
        })
        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })
        let remainder
        if (warns != 0) {
            remainder = warns % configuration?.warnsBeforeMute!;
        }
        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            remainder = 1
            return interaction.reply({ content: "I don't have permission to automatically mute this user!", ephemeral: true })
        }

        if (remainder == 0) {
            const newCase = new Cases({
                guildID: interaction.guild.id,
                userID: user.id,
                modID: interaction.user.id,
                caseType: "Warn",
                caseReason: reason + " Automatic mute due to excess warnings!",
                caseNumber: caseNumberSet,
                caseLength: "Indefinite",
                caseDate: Date.now(),
            })
            newCase.save().catch((err: Error) => console.error(err));

            if (configuration?.dmOnPunish == true) {
                const dm = new EmbedBuilder()
                    .setAuthor({ name: "You Were Muted in " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason} Automatic mute due to excess warnings!
                    <:blurple_bulletpoint:997346294253244529> **Case:** ${caseNumberSet}`)
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

            const warned = new EmbedBuilder()
                .setDescription(`**Case:** ${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
                .setColor(color)
            interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been automatically muted! (Warns **${warns}**)`, embeds: [warned] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Warned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Warn
                > [**Case:** #${caseNumberSet}]

                **Reason:** ${reason} Automatic mute due to excess warnings!
                **Channel:** <#${interaction.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel) { return; }
            if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            return member.timeout(ms("10m"))
        }

        const newCase = new Cases({
            guildID: interaction.guild.id,
            userID: user.id,
            modID: interaction.user.id,
            caseType: "Warn",
            caseReason: reason,
            caseNumber: caseNumberSet,
            caseLength: "None",
            caseDate: Date.now(),
        })
        newCase.save().catch((err: Error) => console.error(err));

        if (configuration?.dmOnPunish == true) {
            const dm = new EmbedBuilder()
                .setAuthor({ name: "You Were Warned in " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
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
        const warned = new EmbedBuilder()
            .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason}`)
            .setColor(color)
        interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been warned (Warns **${warns}**)`, embeds: [warned] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Warned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Warn
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
    }
}