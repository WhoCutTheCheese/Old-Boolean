import { ChatInputCommandInteraction, Client, CommandInteraction, Message, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get Boolean's API latency."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const resultMessage = await interaction.reply({ content: "🔃 Calculating...", fetchReply: true })
        const ping = (resultMessage as Message).createdTimestamp - interaction.createdTimestamp
        interaction.editReply({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
    }
}