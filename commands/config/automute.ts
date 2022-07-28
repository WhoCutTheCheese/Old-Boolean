import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
export default {
    category: "Configuration",
    description: "Change the amount of warns before a user it muted.",
    slash: "both",
    minArgs: 2,
    expectedArgs: "[warnsmute/help] [value]",
    cooldown: "5s",
    options: [
        {
            name: "subcommand",
            description: "warnsmute/help",
            required: true,
            type: "STRING"
        }, {
            name: "value",
            description: "Sub command value",
            required: true,
            type: "STRING",
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const { member, guild, author, channel } = message;
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                switch (args[0]) {
                    case "warnsbeforemute":
                    case "warnsmute":
                        if (!configuration.warnsBeforeMute) {
                            await Config.findOneAndUpdate({
                                guildID: guild?.id,
                            }, {
                                warnsBeforeMute: 3
                            })
                        }
                        if (isNaN(Number.parseInt(args[1]))) {
                            channel.send("Invalid number!")
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: guild?.id,
                        }, {
                            warnsBeforeMute: Number.parseInt(args[1])
                        })
                        const doneEmbed = new MessageEmbed()
                            .setAuthor({ name: "Warns Until Mute", iconURL: author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`The number of warns before a user it automatically muted has been set to **${args[1]}**`)
                            .setColor(configuration.embedColor)
                        channel.send({ embeds: [doneEmbed] })
                        break;
                    default:

                        const automuteHelpEmbed = new MessageEmbed()
                            .setAuthor({ name: "Auto Mute", iconURL: author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Sub Commands for Automute.
                            
                            **warnsmute [Number]**
                            > Set the number of warns a user can recieve before they are automatically muted.`)
                            .setTimestamp()
                            .setColor(configuration.embedColor)
                        channel.send({ embeds: [automuteHelpEmbed] })
                }
                return true;
            } else if (interaction) {
                const { member, guild, user, channel } = interaction;
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                switch (args[0]) {
                    case "warnsbeforemute":
                    case "warnsmute":
                        if (!configuration.warnsBeforeMute) {
                            await Config.findOneAndUpdate({
                                guildID: guild?.id,
                            }, {
                                warnsBeforeMute: 3
                            })
                        }
                        if (isNaN(Number.parseInt(args[1]))) {
                            interaction.reply("Invalid number!")
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: guild?.id,
                        }, {
                            warnsBeforeMute: Number.parseInt(args[1])
                        })
                        const doneEmbed = new MessageEmbed()
                            .setAuthor({ name: "Warns Until Mute", iconURL: user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`The number of warns before a user it automatically muted has been set to **${args[1]}**`)
                            .setColor(configuration.embedColor)
                            interaction.reply({ embeds: [doneEmbed] })
                        break;
                    default:

                        const automuteHelpEmbed = new MessageEmbed()
                            .setAuthor({ name: "Auto Mute", iconURL: user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Sub Commands for Automute.
                            
                            **warnsmute [Number]**
                            > Set the number of warns a user can recieve before they are automatically muted.`)
                            .setTimestamp()
                            .setColor(configuration.embedColor)
                            interaction.reply({ embeds: [automuteHelpEmbed] })
                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand