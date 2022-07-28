import { ICommand } from "wokcommands";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Config from "../../models/config";
const bot = require("../../package.json");
export default {
    category: "User",
    description: "Invite Boolean to your server, or vote for us!.",
    slash: "both",
    aliases: ['add', 'vote'],
    maxArgs: 0,
    cooldown: "3s",

    callback: async ({ message, interaction, client }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id,
                })
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Invite")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
                    new MessageButton()
                        .setLabel("Support Server")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://discord.gg/VD4sf98hKd"),
                    new MessageButton()
                        .setLabel("Vote")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://top.gg/bot/966634522106036265"),

                )

                const invite = new MessageEmbed()
                    .setTitle("Invite Me!")
                    .setColor(configuration.embedColor)
                    .setDescription("Boolean is an easy-to-use and in-depth moderation bot with all the features you need to keep your user in check!")
                message.channel.send({ embeds: [invite], components: [row] })
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id,
                })
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Invite")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
                    new MessageButton()
                        .setLabel("Support Server")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://discord.gg/VD4sf98hKd"),
                    new MessageButton()
                        .setLabel("Vote Top.gg")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://top.gg/bot/966634522106036265"),
                    new MessageButton()
                        .setLabel("Vote Discord Bot List")
                        .setEmoji("🔗")
                        .setStyle("LINK")
                        .setURL("https://discordbotlist.com/bots/boolean")

                )

                const invite = new MessageEmbed()
                    .setTitle("Invite Me!")
                    .setColor(configuration.embedColor)
                    .setDescription("Boolean is an easy-to-use and in-depth moderation bot with all the features you need to keep your user in check!")
                interaction.reply({ embeds: [invite], components: [row] })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand