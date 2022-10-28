import { SlashCommandBuilder, Client, PermissionsBitField, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowComponent, Message, Interaction, ButtonInteraction, ButtonComponent, AnyComponentBuilder, APIButtonComponent, APIActionRowComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("View Boolean statistics."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })
        if(!interaction.channel?.permissionsFor(interaction.guild.members.me!)?.has([ PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel ])) return;
        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const reply = interaction.reply({ content: "Fetching stats...", fetchReply: true })

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL() || undefined })
            .setColor(color)
            .addFields(
                { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
            )
        ;(await reply).edit({ embeds: [embed], content: "" })

    }
}