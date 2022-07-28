import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Configuration",
    description: "Set the embed color.",
    slash: "both",
    aliases: ['embed-color'],
    minArgs: 1,
    expectedArgs: "[Hex Code]",
    cooldown: "5s",
    options: [
        {
            name: "hex",
            description: 'Hex color code.',
            required: true,
            type: 'STRING',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: message.guild?.id
                })
                if (guildSettings.premium === false) {
                    message.channel.send({ content: "This command is for premium users only! Feel free to support Boolean by buying premium!" })
                    return true;
                }
                if (args[0] === "reset") {
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        embedColor: "5865F2"
                    })
                    const resetEmbed = new MessageEmbed()
                        .setTitle("Embed Color")
                        .setColor("5865F2" as ColorResolvable)
                        .setDescription(`Embed Color for ${message.guild?.name} has been changed to #5865F2`)
                    message.channel.send({ embeds: [resetEmbed] })
                    return true;
                }
                let testThing = /[0-9A-Fa-f]{6}/g;
                if (!args[0].startsWith("#")) {
                    message.channel.send({ content: "That is an invalid hex code!" })
                    return true;
                }
                let testingcolor = args[0].replace('#', '').toUpperCase();
                var inputString = testingcolor;
                if (!testThing.test(inputString)) {
                    message.channel.send({ content: "That is an invalid hex code!" })
                    return true;
                }

                await Config.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    embedColor: inputString
                })
                const resetEmbed = new MessageEmbed()
                    .setTitle("Embed Color")
                    .setColor(inputString as ColorResolvable)
                    .setDescription(`Embed Color for ${message.guild?.name} has been changed to #${inputString}`)
                message.channel.send({ embeds: [resetEmbed] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: interaction.guild?.id
                })
                if (guildSettings.premium === false) {
                    interaction.reply({ content: "This command is for premium users only! Feel free to support Boolean by buying premium!", ephemeral: true })
                    return true;
                }
                if (args[0] === "reset") {
                    await Config.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        embedColor: "5865F2"
                    })
                    const resetEmbed = new MessageEmbed()
                        .setTitle("Embed Color")
                        .setColor("5865F2" as ColorResolvable)
                        .setDescription(`Embed Color for ${interaction.guild?.name} has been changed to #5865F2`)
                        interaction.reply({ embeds: [resetEmbed] })
                    return true;
                }
                let testThing = /[0-9A-Fa-f]{6}/g;
                if (!args[0].startsWith("#")) {
                    interaction.reply({ content: "That is an invalid hex code!", ephemeral: true })
                    return true;
                }
                let testingcolor = args[0].replace('#', '').toUpperCase();
                var inputString = testingcolor;
                if (!testThing.test(inputString)) {
                    interaction.reply({ content: "That is an invalid hex code!", ephemeral: true })
                    return true;
                }

                await Config.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                }, {
                    embedColor: inputString
                })
                const resetEmbed = new MessageEmbed()
                    .setTitle("Embed Color")
                    .setColor(inputString as ColorResolvable)
                    .setDescription(`Embed Color for ${interaction.guild?.name} has been changed to #${inputString}`)
                    interaction.reply({ embeds: [resetEmbed] })
                return true;
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand