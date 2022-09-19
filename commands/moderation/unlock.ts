import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Add permission for @everyone to speak in a channel.")
        .addChannelOption(channel =>
            channel.setName("channel")
                .setRequired(false)
                .setDescription("Select the channel you'd like to unlock.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.SendMessages])) return interaction.reply({ content: "I cannot lock this channel!" })

        const channel = interaction.options.getChannel("channel");

        if (!channel) {

            const locked = new EmbedBuilder()
                .setAuthor({ name: "Channel Unlocked", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`This channel has been unlocked.`)
                .setTimestamp()
            interaction.reply({ embeds: [locked] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

                **Channel:** <#${interaction.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel) { return; }
            if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            ((interaction.channel as TextChannel).permissionOverwrites).edit((interaction.channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => console.error(err))

        } else {
            const locked = new EmbedBuilder()
                .setAuthor({ name: "Channel Unlocked", iconURL: interaction.guild.iconURL() || undefined })
                .setColor(color)
                .setDescription(`This channel has been unlocked.`)
                .setTimestamp();
            (channel as TextChannel).send({ embeds: [locked] })

            interaction.reply({ content: `**#${channel.name}** has been unlocked!` })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

                **Channel:** <#${channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel1 = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel1) { return; }
            if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => console.error(err))
        }

    }
}