import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js"
import Settings from "../../models/settings"

module.exports = {
    commands: ['stats', 'ram'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;


        const reply = message.channel.send({ content: "Fetching stats..." })

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL() || undefined })
            .setColor(color)
            .addFields(
                { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
            )
            ; (await reply).edit({ embeds: [embed], content: "" })

    },
}