import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
import Config from "../../models/config";
export default {
    category: "User",
    description: "View a user's profile picture enlarged.",
    slash: "both",
    aliases: ['av', 'pfp'],
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: "(@User || User ID)",
    cooldown: "3s",
    options: [
        {
            name: "user",
            description: 'The user you choose to view.',
            required: false,
            type: 'USER',
        }
    ],

    callback: async ({ message, args, interaction }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                let user = message.mentions.members?.first() || message.guild?.members.cache.get(args[1]);
                if (!args[0]) {
                    const av = new MessageEmbed()
                        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(configuration.embedColor)
                        .setImage(`${message.author.displayAvatarURL({ size: 512, dynamic: true })}`)
                    return message.channel.send({ embeds: [av] })
                }
                if (!user) { return message.channel.send({ content: "Invalid User" }); }
                const av = new MessageEmbed()
                    .setAuthor({ name: `${user.user.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || ""})
                    .setColor(configuration.embedColor)
                    .setImage(`${user.user.displayAvatarURL({ size: 512, dynamic: true })}`)
                message.channel.send({ embeds: [av] })
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const user = await interaction.guild?.members.cache.get(args[0]);
                if (!args[0]) {
                    const av = new MessageEmbed()
                        .setAuthor({ name: `${interaction.user?.tag}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(configuration.embedColor)
                        .setImage(`${interaction.user?.displayAvatarURL({ size: 512, dynamic: true })}`)
                    interaction.reply({ embeds: [av] })
                    return;
                } else {
                    const av = new MessageEmbed()
                        .setAuthor({ name: `${user?.user.tag}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(configuration.embedColor)
                        .setImage(`${user?.user.displayAvatarURL({ size: 512, dynamic: true })}`)
                    interaction.reply({ embeds: [av] })
                    return;
                }
            }
        } catch {
            (err: Error) => {
                console.log(err)
            }
        }
    }
} as ICommand