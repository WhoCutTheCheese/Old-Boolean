import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Change a channel's slowmode.",
    slash: "both",
    aliases: ['sm'],
    permissions: ["MANAGE_MESSAGES"],
    minArgs: 1,
    expectedArgs: "[Time]",
    cooldown: "2s",
    options: [
        {
            name: "time",
            description: 'Channel slow mode.',
            required: true,
            type: 'NUMBER',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to edit slowmode! Run **!!check** to finish setting me up!" })
                    return true;
                }
                if (Number.isNaN(parseInt(args[0]))) {
                    message.channel.send({ content: "Invalid time-frame" })
                    return true;
                }
                if (parseInt(args[0]) > 21600 || parseInt(args[0]) < 0) {
                    message.channel.send({ content: "Invalid time-frame" })
                    return true;
                }
                (message.channel as TextChannel).setRateLimitPerUser(parseInt(args[0])).catch((err: Error) => console.log(err))
                const successEmbed = new MessageEmbed()
                    .setDescription(`<:arrow_right:967329549912248341> Slowmode has been set to **${args[0]} second(s)**!`)
                    .setColor(configuration.embedColor)
                message.channel.send({ embeds: [successEmbed] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    interaction.reply({ content: "I don't have permission to edit slowmode! Run **!!check** to finish setting me up!" })
                    return true;
                }
                if (Number.isNaN(parseInt(args[0]))) {
                    interaction.reply({ content: "Invalid time-frame" })
                    return true;
                }
                if (parseInt(args[0]) > 21600 || parseInt(args[0]) < 0) {
                    interaction.reply({ content: "Invalid time-frame" })
                    return true;
                }
                (interaction.channel as TextChannel).setRateLimitPerUser(parseInt(args[0])).catch((err: Error) => console.log(err))
                const successEmbed = new MessageEmbed()
                    .setDescription(`<:arrow_right:967329549912248341> Slowmode has been set to **${args[0]} second(s)**!`)
                    .setColor(configuration.embedColor)
                interaction.reply({ embeds: [successEmbed] })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand