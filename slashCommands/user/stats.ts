import { SlashCommandBuilder, Client, PermissionsBitField, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowComponent, Message, Interaction, ButtonInteraction, ButtonComponent, AnyComponentBuilder, APIButtonComponent, APIActionRowComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("View Boolean statistics."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })
        if(!interaction.guild.members.me?.permissions.has([ PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.EmbedLinks ])) return;
        if(!interaction.channel?.permissionsFor(interaction.guild.members.me!)?.has([ PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.EmbedLinks ])) return;
        const configuration = await Configuration.findOne({
            guildID: interaction.guild?.id
        })

        const reply = interaction.reply({ content: "Fetching stats...", fetchReply: true })

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL() || undefined })
            .setColor(configuration?.embedColor as ColorResolvable)
            .addFields(
                { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
            )
        ;(await reply).edit({ embeds: [embed], content: "" })

    }
}