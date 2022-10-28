import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["automod", "am"],
    commandName: "AUTOMOD",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 3,
    expectedArgs: "[blocklinks/blockscams/massmentions/mentionscap/whitelist/help] [true/false || website || mention cap]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        switch (args[0].toLowerCase()) {
            case "blocklinks":

                if (args[1].toLowerCase() == "true" || args[1].toLowerCase() == "on") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            blockLinks: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Link blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else if (args[1].toLowerCase() == "false" || args[1].toLowerCase() == "off") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockLinks: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Link blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else return message.channel.send({ content: "Invalid argument! Ex. `!!automod blocklinks true/false`" })

                break;
            case "blockscams":

                if (args[1].toLowerCase() == "true" || args[1].toLowerCase() == "on") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            blockScams: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Scam blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else if (args[1].toLowerCase() == "false" || args[1].toLowerCase() == "off") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockScams: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Scam blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else return message.channel.send({ content: "Invalid argument! Ex. `!!automod blockscams true/false`" })

                break;
            case "massmention":

                if (args[1].toLowerCase() == "true" || args[1].toLowerCase() == "on") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            massMentions: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Mention spam blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else if (args[1].toLowerCase() == "false" || args[1].toLowerCase() == "off") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { massMentions: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Mention spam blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else return message.channel.send({ content: "Invalid argument! Ex. `!!automod massmention true/false`" })


                break;
            case "mentionscap":

                if (isNaN(Number(args[1]))) return message.channel.send({ content: "Please provide a valid number! Ex. `!!automod mentionscap 3`" })

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    autoModSettings: {
                        maxMentions: Number(args[1])
                    }
                })

                const mentionCap = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Mention spam cap is now set to \`${args[1]}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [mentionCap] })

                break;
            case "blocklinks":

                if (args[1].toLowerCase() == "true" || args[1].toLowerCase() == "on") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            blockInvites: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Invite blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else if (args[1].toLowerCase() == "false" || args[1].toLowerCase() == "off") {
                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockInvites: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Invite blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })
                } else return message.channel.send({ content: "Invalid argument! Ex. `!!automod blockinvites true/false`" })

                break;
            case "whitelist":

                if (args[1].toLowerCase() == "add") {

                    if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(args[2])) return message.channel.send({ content: "Invalid website provided! Ex. `!!automod whitelist add https://google.com`" })

                    if (settings.autoModSettings?.websiteWhitelist.includes(args[2])) return message.channel.send({ content: "This website is already whitelisted!" })

                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $push: { websiteWhitelist: args[2] }
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Added \`${args[2]}\` to the website filter bypass!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })

                } else if (args[1].toLowerCase() == "remove") {

                    if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(args[2])) return message.channel.send({ content: "Invalid website provided! Ex. `!!automod whitelist add https://google.com`" })

                    let websiteFilter
                    if (settings.autoModSettings?.websiteWhitelist) {
                        websiteFilter = settings.autoModSettings?.websiteWhitelist
                    } else return message.channel.send({ content: "No websites are whitelisted." })
                    const whitelistIndex = websiteFilter.indexOf(args[2])

                    if (whitelistIndex > -1) {
                        websiteFilter.splice(whitelistIndex, 1)
                    }

                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            websiteWhitelist: websiteFilter
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Removed \`${args[2]}\` from the website filter bypass!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })


                } else if (args[1].toLowerCase() == "clear") {

                    await Settings.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { whitelist: "" }
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Cleared the website filter!`)
                        .setColor(color)
                        .setTimestamp()
                    message.channel.send({ embeds: [embed] })

                } else return message.channel.send({ content: "Invalid argument! Ex. `!!automod whitelist add/remove/clear (Website)`" })

                break;
            default:
                if (!settings.autoModSettings) return message.channel.send({ content: "You have no settings saved!" })
                let whitelisted: string[] = []
                if (settings.autoModSettings.websiteWhitelist) {
                    for (const whitelist of settings.autoModSettings.websiteWhitelist) {
                        whitelisted.push(`\n ${whitelist}`)
                    }
                }
                if (whitelisted.length == 0) {
                    whitelisted.push(`None`)
                }
                let blockLinks: any = settings.autoModSettings.blockLinks
                if (!blockLinks) blockLinks = "false"
                let blockScams: any = settings.autoModSettings.blockScams
                if (!blockScams) blockScams = "false"
                let massMention: any = settings.autoModSettings.massMentions
                if (!massMention) massMention = "false"
                let maxMentions: Number | undefined = settings.autoModSettings.maxMentions
                if (!maxMentions) maxMentions = 3

                const helpEmbed = new EmbedBuilder()
                    .setAuthor({ name: "Auto-Moderation Configuration" })
                    .setDescription(`These are the configuration settings for Boolean's automoderation.
                    Run \`!!automod help\` for a list of sub commands.
                    
                    **__Settings:__**

                    > **Block Links:** \`${blockLinks}\`
                    Boolean will automatically warn anyone who sends a link.
                    By default Discord & Tenor are added to the whitelist. But you can add your own options.

                    > **Block Scams:** \`${blockScams}\`
                    This option allows Boolean to block Discord Nitro scams with a preset list.

                    > **Mass Mentions:** \`${massMention}\`
                    Boolean will block anyone who pings more than the limit. (Default limit is 3)

                    > **Mass Mention Limit:** \`${maxMentions}\`
                    The max amount of users a user can ping before being warned.
                    
                    > **Whitelisted Websites:** ${whitelisted}`)
                    .setColor(color)
                message.channel.send({ embeds: [helpEmbed] })

        }

    }
}