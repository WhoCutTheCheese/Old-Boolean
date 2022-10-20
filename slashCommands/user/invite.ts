import { ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, ColorResolvable, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Configuration from "../../models/config"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite Boolean to your server!"),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const configuration = await Configuration.findOne({
            guildID: interaction.guild?.id
        })
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite")
                    .setEmoji("🔗")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
                new ButtonBuilder()
                    .setLabel("Support Server")
                    .setEmoji("🔗")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.gg/VD4sf98hKd"),
                new ButtonBuilder()
                    .setLabel("Vote Top.gg")
                    .setEmoji("🔗")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://top.gg/bot/966634522106036265"),
                new ButtonBuilder()
                    .setLabel("Vote Discord Bot List")
                    .setEmoji("🔗")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discordbotlist.com/bots/boolean")

            )

        const invite = new EmbedBuilder()
            .setTitle("Invite Me!")
            .setColor(configuration?.embedColor as ColorResolvable)
            .setDescription("Invite me to get an advanced moderation bot for all your server's needs! If you need help, visit our docs: [Coming Soon](https://google.com)")
        interaction.reply({ embeds: [invite], components: [row] })
    }
}