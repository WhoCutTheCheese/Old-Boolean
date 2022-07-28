import { ICommand } from "wokcommands";
import { ColorResolvable, GuildChannel, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
export default {
    category: "Configuration",
    description: "Set the mod logging channel.",
    slash: "both",
    minArgs: 1,
    expectedArgs: "[Sub Command] (#Channel/Channel ID)",
    cooldown: "5s",
    options: [
        {
            name: "subcommand",
            description: "View/Set/Reset",
            required: true,
            type: "STRING"
        }, {
            name: "channel",
            description: "Set the mod log channel.",
            required: false,
            type: "CHANNEL",
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                switch (args[0]) {
                    case "reset":
                        message.channel.send("Mod log channel reset.")
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            modLogChannel: "None"
                        })
                        break;
                    case "view":
                        let modLogsChannel
                        if (configuration.modLogChannel === "None") { modLogsChannel = "None" }
                        if (configuration.modLogChannel !== "None") { modLogsChannel = `<#${configuration.modLogChannel}>` }
                        const viewEmbed = new MessageEmbed()
                            .setAuthor({ name: "Current Mod Log Channel", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription(`**__Current Mod Log Channel:__**
                            [${modLogsChannel}]`)
                        message.channel.send({ embeds: [viewEmbed] })
                        break;
                    case "set":
                        const channel = message.mentions.channels.first() || message.guild?.channels.fetch(args[1])
                        if (!channel) {
                            message.channel.send({ content: "Invalid channel." })
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            modLogChannel: (channel as GuildChannel).id
                        })
                        const successEmbed = new MessageEmbed()
                            .setDescription(`<:arrow_right:967329549912248341> **Mod Logging channel set to <#${(channel as GuildChannel).id}>**`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [successEmbed] })
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setAuthor({ name: "Mod Logs", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription(`View, set and delete the Mod Logging channel.
                            
                            **__Sub Commands__**
                            > **View:** [View the current mod log channel.]
                            > **Set:** [Set the mod logging channel.]
                            > **Remove:** [Delete the mod logging channel.]`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        message.channel.send({ embeds: [defaultEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                switch (args[0]) {
                    case "reset":
                        interaction.reply("Mod log channel reset.")
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            modLogChannel: "None"
                        })
                        break;
                    case "view":
                        let modLogsChannel
                        if (configuration.modLogChannel === "None") { modLogsChannel = "None" }
                        if (configuration.modLogChannel !== "None") { modLogsChannel = `<#${configuration.modLogChannel}>` }
                        const viewEmbed = new MessageEmbed()
                            .setAuthor({ name: "Current Mod Log Channel", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription(`**__Current Mod Log Channel:__**
                            [${modLogsChannel}]`)
                        interaction.reply({ embeds: [viewEmbed] })
                        break;
                    case "set":
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === args[1])
                        if (!channel) {
                            interaction.reply({ content: "Invalid channel." })
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id
                        }, {
                            modLogChannel: (channel as GuildChannel).id
                        })
                        const successEmbed = new MessageEmbed()
                            .setDescription(`<:arrow_right:967329549912248341> **Mod Logging channel set to <#${(channel as GuildChannel).id}>**`)
                            .setColor(configuration.embedColor)
                        interaction.reply({ embeds: [successEmbed] })
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setAuthor({ name: "Mod Logs", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription(`View, set and delete the Mod Logging channel.
                            
                            **__Sub Commands__**
                            > **View:** [View the current mod log channel.]
                            > **Set:** [Set the mod logging channel.]
                            > **Remove:** [Delete the mod logging channel.]`)
                            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                        interaction.reply({ embeds: [defaultEmbed] })
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