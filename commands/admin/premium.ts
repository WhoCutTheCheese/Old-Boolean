import { ICommand } from "wokcommands";
import { ButtonInteraction, ColorResolvable, MessageActionRow, MessageButton, MessageEmbed, Interaction } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
import Tokens from "../../models/tokens";
export default {
    category: "Administration",
    description: "Redeem premium.",
    slash: "both",
    minArgs: 1,
    expectedArgs: "[Redeem/Revoke/Status/Balance]",
    cooldown: "5s",
    options: [
        {
            name: "subcommand",
            description: 'Redeem/Revoke/Status/Balance.',
            required: true,
            type: 'STRING',
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const hasToken = await Tokens.findOne({
                    userID: message.author?.id,
                })
                const guildStuff = await Guild.findOne({
                    guildID: message.guild?.id,
                })
                switch (args[0]) {
                    case "redeem":
                        if (!hasToken) {
                            message.channel.send({ content: "You don't have any premium tokens!" })
                            return;
                        }
                        if (hasToken.tokens === 0) {
                            message.channel.send({ content: "You don't have any premium tokens!" })
                            return;
                        }
                        if (guildStuff.premium === true) {
                            message.channel.send({ content: "This guild already has premium enabled! " })
                            return;
                        }
                        await Tokens.findOneAndUpdate({
                            userID: message.author.id,
                        }, {
                            tokens: hasToken.tokens - 1,
                        })
                        await Guild.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            premium: true,
                            premiumHolder: message.author.id
                        })
                        const premiumEnabled = new MessageEmbed()
                            .setTitle("Premium Enabled")
                            .setColor(configuration.embedColor)
                            .setDescription("Thank you for supporting Boolean! You can revoke premium to get your token back at any time.")
                            .setFooter({
                                text: "Premium enabled by " + message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true })
                            })
                        message.channel.send({ embeds: [premiumEnabled] })
                        break;
                    case "revoke":
                        if (guildStuff.premiumHolder !== message.author.id) {
                            message.channel.send({ content: "You cannot revoke someone else's premium!" })
                            return;
                        }
                        if (guildStuff.premium === false) {
                            message.channel.send({ content: "Does not have premium enabled! " })
                            return;
                        }
                        await Tokens.findOneAndUpdate({
                            userID: message.author.id,
                        }, {
                            tokens: hasToken.tokens + 1,
                        })
                        await Guild.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            premium: false,
                            premiumHolder: "None",
                            color: "5865F2",
                        })
                        const premDisabled = new MessageEmbed()
                            .setTitle("Premium Revoked")
                            .setColor(configuration.embedColor)
                            .setDescription("You have revoked premium from this guild and your token has been refunded.")
                        message.channel.send({ embeds: [premDisabled] })
                        break;
                    case "status":
                    case "check":
                        if (guildStuff.premium === false) {
                            message.channel.send({ content: "This guild does not have premium enabled! " })
                            return;
                        }
                        const premiumStatus = new MessageEmbed()
                            .setAuthor({ name: message.guild?.name + "'s Premium Status", iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("**Premium:** true\n**Premium Holder:** <@" + guildStuff.premiumHolder + ">")
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        message.channel.send({ embeds: [premiumStatus] })
                        break;
                    case "balance":
                    case "bal":
                        if (!hasToken) {
                            message.reply("You have no tokens >:)")
                            return;
                        }
                        const hoeEmbed = new MessageEmbed()
                            .setAuthor({ name: `${message.author.tag}'s Balance`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`**Tokens:** ${hasToken.tokens}`)
                            .setColor(configuration.embedColor)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        message.channel.send({ embeds: [hoeEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const hasToken = await Tokens.findOne({
                    userID: interaction.user?.id,
                })
                const guildStuff = await Guild.findOne({
                    guildID: interaction.guild?.id,
                })
                switch (args[0]) {
                    case "redeem":
                        if (!hasToken) {
                            interaction.reply({ content: "You don't have any premium tokens!" })
                            return;
                        }
                        if (hasToken.tokens === 0) {
                            interaction.reply({ content: "You don't have any premium tokens!" })
                            return;
                        }
                        if (guildStuff.premium === true) {
                            interaction.reply({ content: "This guild already has premium enabled! " })
                            return;
                        }
                        await Tokens.findOneAndUpdate({
                            userID: interaction.user.id,
                        }, {
                            tokens: hasToken.tokens - 1,
                        })
                        await Guild.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            premium: true,
                            premiumHolder: interaction.user.id
                        })
                        const premiumEnabled = new MessageEmbed()
                            .setTitle("Premium Enabled")
                            .setColor(configuration.embedColor)
                            .setDescription("Thank you for supporting Boolean! You can revoke premium to get your token back at any time.")
                            .setFooter({
                                text: "Premium enabled by " + interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                            })
                        interaction.reply({ embeds: [premiumEnabled] })
                        break;
                    case "revoke":
                        if (guildStuff.premiumHolder !== interaction.user.id) {
                            interaction.reply({ content: "You cannot revoke someone else's premium!" })
                            return;
                        }
                        if (guildStuff.premium === false) {
                            interaction.reply({ content: "Does not have premium enabled! " })
                            return;
                        }
                        await Tokens.findOneAndUpdate({
                            userID: interaction.user.id,
                        }, {
                            tokens: hasToken.tokens + 1,
                        })
                        await Guild.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            premium: false,
                            premiumHolder: "None",
                            color: "5865F2",
                        })
                        const premDisabled = new MessageEmbed()
                            .setTitle("Premium Revoked")
                            .setColor(configuration.embedColor)
                            .setDescription("You have revoked premium from this guild and your token has been refunded.")
                        interaction.reply({ embeds: [premDisabled] })
                        break;
                    case "status":
                    case "check":
                        if (guildStuff.premium === false) {
                            interaction.reply({ content: "This guild does not have premium enabled! " })
                            return;
                        }
                        const premiumStatus = new MessageEmbed()
                            .setAuthor({ name: interaction.guild?.name + "'s Premium Status", iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("**Premium:** true\n**Premium Holder:** <@" + guildStuff.premiumHolder + ">")
                            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                        interaction.reply({ embeds: [premiumStatus] })
                        break;
                    case "balance":
                    case "bal":
                        if (!hasToken) {
                            interaction.reply("You have no tokens >:)")
                            return;
                        }
                        const hoeEmbed = new MessageEmbed()
                            .setAuthor({ name: `${interaction.user.tag}'s Balance`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`**Tokens:** ${hasToken.tokens}`)
                            .setColor(configuration.embedColor)
                            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        interaction.reply({ embeds: [hoeEmbed] })
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