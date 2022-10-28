import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Remove permission for @everyone to speak in a channel.")
        .addChannelOption(channel =>
            channel.setName("channel")
                .setRequired(false)
                .setDescription("Select the channel you'd like to lock.")
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
        if (thePermit?.commandAccess.includes("LOCK") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("LOCK") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })
        const channel = interaction.options.getChannel("channel");

        if (!channel) {

            const locked = new EmbedBuilder()
                .setAuthor({ name: "Channel Locked", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`This channel has been locked, you are not able to talk as of now.`)
                .setTimestamp()
            interaction.reply({ embeds: [locked] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Locked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Lock

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
            ((interaction.channel as TextChannel).permissionOverwrites).edit((interaction.channel as TextChannel).guild.id, {
                SendMessages: false
            }).catch((err: Error) => console.error(err))

        } else {
            const locked = new EmbedBuilder()
                .setAuthor({ name: "Channel Locked", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`This channel has been locked, you are not able to talk as of now.`)
                .setTimestamp();
            (channel as TextChannel).send({ embeds: [locked] })

            interaction.reply({ content: `**#${channel.name}** has been locked!` })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Locked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Lock

                **Channel:** <#${channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel1 = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (interaction.guild.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SendMessages: false
            }).catch((err: Error) => console.error(err))
        }

    }
}