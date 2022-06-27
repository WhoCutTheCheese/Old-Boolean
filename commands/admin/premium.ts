import { MessageEmbed, Client, Message } from 'discord.js';
import Tokens from "../../models/tokens";
import Guild from "../../models/guild";
module.exports = {
    commands: ["premium"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Redeem/Revoke/Status/Balance]",
    userPermissions: ["MANAGE_GUILD"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        const hasToken = await Tokens.findOne({
            userID: message.author.id,
        })
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        if (!hasToken) {
            return message.channel.send({ content: "You don't have any premium tokens!" })
        }
        if (hasToken.tokens === 0) {
            return message.channel.send({ content: "You don't have any premium tokens!" })
        }
        switch (args[0]) {
            case "redeem":
                if (guildSettings.premium === true) {
                    return message.channel.send({ content: "This guild already has premium enabled! " })
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
                    .setColor(guildSettings.color)
                    .setDescription("Thank you for supporting Boolean! You can revoke premium to get your token back at any time.")
                    .setFooter({
                        text: "Premium enabled by " + message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                message.channel.send({ embeds: [premiumEnabled] })
                break;
            case "revoke":
                if (guildSettings.premiumHolder !== message.author.id) {
                    return message.channel.send({ content: "You cannot revoke someone else's premium!" })
                }
                if (guildSettings.premium === false) {
                    return message.channel.send({ content: "Does not have premium enabled! " })
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
                    .setColor(guildSettings.color)
                    .setDescription("You have revoked premium from this guild and your token has been refunded.")
                message.channel.send({ embeds: [premDisabled] })
                break;
            case "status":
            case "check":
                if (guildSettings.premium === false) {
                    return message.channel.send({ content: "This guild does not have premium enabled! " })
                }
                const premiumStatus = new MessageEmbed()
                    .setAuthor({ name: message.guild?.name + "'s Premium Status", iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                    .setColor(guildSettings.color)
                    .setDescription("**Premium:** true\n**Premium Holder:** <@" + guildSettings.premiumHolder + ">")
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                message.channel.send({ embeds: [premiumStatus] })
                break;
            case "balance":
            case "bal":
                const warnings = await Guild.find({
                    premiumHolder: message.author.id,
                })
                let serversList = ""
                for (const warn of warnings) {
                    serversList += `${warn.guildName}, `
                }
                const hoeEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message.author.tag}'s Balance`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Tokens:** ${hasToken.tokens}\n**Active Servers**\n${serversList}`)
                    .setColor(guildSettings.color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                message.channel.send({ embeds: [hoeEmbed] })
        }
    }

}