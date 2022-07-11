import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from 'discord.js'
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['stats'],
    maxArgs: 0,
    minargs: 0,
    cooldown: 0,
    devOnly: true,
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id
        })
        message.channel.send({ content: "Fetching stats..." }).then((result: Message) => {
            const statsEmbed = new MessageEmbed()
                .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || "" })
                .setColor(guildSettings.color)
                .addFields(
                    { name: "Total Guilds", value: `${client.guilds.cache.size}` },
                    { name: "Cached Users", value: `${client.users.cache.size}` },
                    { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
                )
            result.edit({ embeds: [statsEmbed] })
        })
    },
}