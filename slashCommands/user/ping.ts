import { ChatInputCommandInteraction, Client, CommandInteraction, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get Boolean's API latency."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (interaction.inCachedGuild()) {
            if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.EmbedLinks])) return;
            if (!interaction.channel?.permissionsFor(interaction.guild.members.me!)?.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.EmbedLinks])) return;
        }
        const resultMessage = await interaction.reply({ content: "🔃 Calculating...", fetchReply: true })
        const ping = (resultMessage as Message).createdTimestamp - interaction.createdTimestamp
        interaction.editReply({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
    }
}