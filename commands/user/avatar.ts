import { SlashCommandBuilder, CommandInteraction, Client, EmbedBuilder, ColorResolvable, GuildMember, User, Role, ChatInputCommandInteraction } from "discord.js";
import Configuration from "../../models/config";

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

        const configuration = await Configuration.findOne({
            guildID: interaction.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;
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