import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js"
import Configuration from "../../models/config";

module.exports = {
    commands: ['stats', 'ram'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })

        const reply = message.channel.send({ content: "Fetching stats..." })

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL() || undefined })
            .setColor(configuration?.embedColor as ColorResolvable)
            .addFields(
                { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
            )
            ; (await reply).edit({ embeds: [embed], content: "" })

    },
}