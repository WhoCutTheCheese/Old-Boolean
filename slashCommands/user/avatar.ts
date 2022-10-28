import { SlashCommandBuilder, Client, EmbedBuilder, ColorResolvable, ChatInputCommandInteraction } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Enlarges a user's avatar.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(false)
                .setDescription("Select a user.")
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if(!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
        
        const user = interaction.options.getUser("user");
        if (!user) {
            const userInfoAuthor = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user?.username}'s Avatar`, iconURL: interaction.user?.avatarURL() || undefined })
                .setImage(interaction.user?.displayAvatarURL({ size: 512 }) || null)
                .setColor(color)
                .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: interaction.user?.avatarURL() || undefined })
            return interaction.reply({ embeds: [userInfoAuthor] })
        }
        const userInfoAuthor = new EmbedBuilder()
            .setAuthor({ name: `${user?.username}'s Avatar`, iconURL: user?.avatarURL() || undefined })
            .setImage(user?.displayAvatarURL({ size: 512 }) || null)
            .setColor(color)
            .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: interaction.user?.avatarURL() || undefined })
        return interaction.reply({ embeds: [userInfoAuthor] })

    }
}