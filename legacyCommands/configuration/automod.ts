import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";
import AConfig from "../../models/automodConfig";

module.exports = {
    commands: ["automod", "am"],
    commandName: "AUTOMOD",
    commandCategory: "CONFIGURATION",
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "[blocklinks/blockscam/massmention/mentionscap/whitelist/help] [true/false || website || mention cap]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })

        const color = configuration?.embedColor as ColorResolvable

        const automodConfig = await AConfig.findOne({
            guildID: message.guild?.id
        })
        if (!automodConfig) {
            const newAutomodConfig = new AConfig({
                guildID: message.guild?.id,
                blockLinks: false,
                blockScams: false,
                massMentions: false,
                maxMentions: 3,
                websiteWhitelist: ["https://youtube.com", "https://tenor.com", "https://cdn.discord.com", "https://discord.com"],
            })
            newAutomodConfig.save().catch((err: Error) => { console.log(err) })
            return message.channel.send({ content: "Creating configuration file... Please run this command again!" })
        }

        switch (args[0].toLowerCase()) {
            case "blocklinks":

                let boolean: boolean
                let emote: string
                if (args[1].toLowerCase() === "true" || args[1].toLowerCase() === "on") {
                    boolean = true
                    emote = "<:yes:979193272612298814>"
                } else if (args[1].toLowerCase() === "false" || args[1].toLowerCase() === "off") {
                    boolean = false
                    emote = "<:no:979193272784265217>"
                } else return message.channel.send({ content: "Please provide a valid boolean! Ex. `!!automod blocklinks true/false`" });

                await AConfig.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    blockLinks: boolean
                })

                const blockedLinks = new EmbedBuilder()
                    .setDescription(`${emote} Link blocking is now set to \`${boolean}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [blockedLinks] })

                break;
            case "blockscam":

                let onOrOff: boolean
                let emoji: string
                if (args[1].toLowerCase() === "true" || args[1].toLowerCase() === "on") {
                    onOrOff = true
                    emoji = "<:yes:979193272612298814>"
                } else if (args[1].toLowerCase() === "false" || args[1].toLowerCase() === "off") {
                    onOrOff = false
                    emoji = "<:no:979193272784265217>"
                } else return message.channel.send({ content: "Please provide a valid boolean! Ex. `!!automod blockscam true/false`" });

                await AConfig.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    blockScams: onOrOff
                })

                const blockedScams = new EmbedBuilder()
                    .setDescription(`${emoji} Scam blocking is now set to \`${onOrOff}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [blockedScams] })


                break;
            case "massmention":

                let trueOrFalse: boolean
                let emoticon: string
                if (args[1].toLowerCase() === "true" || args[1].toLowerCase() === "on") {
                    trueOrFalse = true
                    emoticon = "<:yes:979193272612298814>"
                } else if (args[1].toLowerCase() === "false" || args[1].toLowerCase() === "off") {
                    trueOrFalse = false
                    emoticon = "<:no:979193272784265217>"
                } else return message.channel.send({ content: "Please provide a valid boolean! Ex. `!!automod massmention true/false`" });

                await AConfig.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    massMentions: trueOrFalse
                })

                const blockMassMention = new EmbedBuilder()
                    .setDescription(`${emoticon} Scam blocking is now set to \`${trueOrFalse}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [blockMassMention] })

                break;
            case "mentionscap":

                if (isNaN(Number(args[1]))) return message.channel.send({ content: "Please provide a valid number! Ex. `!!automod mentionscap 3`" })

                await AConfig.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    maxMentions: Number(args[1])
                })

                const mentionCap = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Mention cap is now set to \`${args[1]}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [mentionCap] })

                break;
            case "whitelist":
                if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(args[1])) return message.channel.send({ content: "Invalid website provided! Ex. https://google.com" })

                await AConfig.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    $push: { websiteWhitelist: args[1] }
                })

                const whitelist = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Added \`${args[1]}\` to the website whitelist!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [whitelist] })
                break;
            default:

                let whitelisted: string[] = []
                for (const whitelist of automodConfig?.websiteWhitelist!) {
                    whitelisted.push(`\n ${whitelist}`)
                }
                if (whitelisted.length == 0) {
                    whitelisted.push(`None`)
                }

                const helpEmbed = new EmbedBuilder()
                    .setAuthor({ name: "Auto-Moderation Configuration" })
                    .setDescription(`These are the configuration settings for Boolean's automoderation.
                    Run \`!!automod help\` for a list of sub commands.
                    
                    **__Settings:__**

                    > **Block Links:** \`${automodConfig?.blockLinks}\`
                    Boolean will automatically warn anyone who sends a link.
                    By default Discord & Tenor are added to the whitelist. But you can add your own options.

                    > **Block Scams:** \`${automodConfig?.blockScams}\`
                    This option allows Boolean to block Discord Nitro scams with a preset list.

                    > **Mass Mentions:** \`${automodConfig?.massMentions}\`
                    Boolean will block anyone who pings more than the limit. (Default limit is 3)

                    > **Mass Mention Limit:** \`${automodConfig?.maxMentions}\`
                    The max amount of users a user can ping before being warned.
                    
                    > **Whitelisted Websites:** ${whitelisted}`)
                    .setColor(color)
                message.channel.send({ embeds: [helpEmbed] })

        }

    }
}