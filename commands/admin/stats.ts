import { ICommand } from "wokcommands";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Administration",
    description: "Boolean information.",
    slash: "both",
    aliases: [],
    maxArgs: 0,
    cooldown: "5s",
    ownerOnly: true,
    hidden: true,

    callback: async ({ message, interaction, client }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                message.channel.send({ content: "Fetching stats..." }).then((result: Message) => {
                    const statsEmbed = new MessageEmbed()
                        .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(configuration.embedColor)
                        .addFields(
                            { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                            { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                            { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
                        )
                    result.edit({ embeds: [statsEmbed] })
                })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const statsEmbed2 = new MessageEmbed()
                .setAuthor({ name: `${client.user?.username} Stats`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || "" })
                .setColor(configuration.embedColor)
                .addFields(
                    { name: "Total Guilds", value: `${client.guilds.cache.size.toLocaleString()}` },
                    { name: "Cached Users", value: `${client.users.cache.size.toLocaleString()}` },
                    { name: "Ram Usage", value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\` / \`512 MB\`` }
                )
                interaction.reply({ embeds: [statsEmbed2] })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand