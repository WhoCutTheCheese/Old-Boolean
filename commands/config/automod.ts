import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
import automodConfig from "../../models/automodConfig";
export default {
    category: "Configuration",
    description: "Edit automod settings.",
    permissions: ["MANAGE_GUILD"],
    slash: "both",
    maxArgs: 2,
    cooldown: "5s",
    ownerOnly: true,

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const aConfig = await automodConfig.findOne({
                    guildID: message.guild?.id,
                })
                const configuration = await Config.findOne({
                    guildID: message.guild?.id,
                })
                if (!aConfig) {
                    const newAutomod = new automodConfig({
                        guildID: message.guild?.id,
                        blockLinks: false,
                        blockScams: false,
                        massMentions: false,
                        maxMentions: 3,
                        websiteWhitelist: ["https://cdn.discordapp.com", "https://discord.com", "https://tenor.com", "https://media.discordapp.net"],
                    })
                    newAutomod.save()
                    return "Boolean has created an automod file for you! Please run the command again."
                }
                switch (args[0]) {
                    case "help":
                        const automodHelp = new MessageEmbed()
                            .setAuthor({ name: "Auto-Moderation Help", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Setup Boolean's AutoMod with these commands!
                            **Usage:** !!automod [sub command] [value]
                        
                            **__Sub-Commands__**
                            \`blocklinks\`, \`blockscams\`, \`massmention\`, \`mentionscap\`, \`whitelist\``)
                            .setFooter({ text: `Requsted by ${message.author.tag}` })
                            .setColor(configuration.embedColor)
                        return automodHelp;
                        break;
                    case "blocklinks":
                        let result
                        if (args[1] == "true") {
                            result = true
                        } else if (args[1] == "false") {
                            result = false
                        } else {
                            const helpBlockEmbed = new MessageEmbed()
                                .setAuthor({ name: "Block Links", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription(`This setting will enable whether or not Boolean will block links from being sent. This has a customizable whitelist.
                                **Usage:** \`!!automod blocklinks true/false\``)
                            return helpBlockEmbed;
                        }
                        automodConfig.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            blockLinks: result
                        })
                        const successBlockEmbed = new MessageEmbed()
                            .setAuthor({ name: "Blocking Links", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("Boolean will now block any links not in the whitelist.")
                        return successBlockEmbed;
                        break;
                    case "blockscams":
                        let result2
                        if (args[1] == "true") {
                            result2 = true
                        } else if (args[1] == "false") {
                            result2 = false
                        } else {
                            const helpBlockEmbed = new MessageEmbed()
                                .setAuthor({ name: "Block Scams", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription(`This settings will block any Discord nitro scam links.
                                *Not necessary if Block Links is enabled.*
                                **Usage:** \`!!automod blockscams true/false\``)
                            return helpBlockEmbed;
                        }
                        automodConfig.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            blockScams: result2
                        })
                        const successScamEmbed = new MessageEmbed()
                            .setAuthor({ name: "Blocking Links", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("Boolean will now block every Discord nitro scam website in it's database.")
                        return successScamEmbed;
                        break;
                    case "massmention":
                        let result3
                        if (args[1] == "true") {
                            result3 = true
                        } else if (args[1] == "false") {
                            result3 = false
                        } else {
                            const massMentionEmbedHelp = new MessageEmbed()
                                .setAuthor({ name: "Mass Mentions", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription(`This settings will block users from mass pinging users.
                                This options has a customizable limit.
                                **Usage:** \`!!automod massmention true/false\``)
                            return massMentionEmbedHelp;
                        }
                        automodConfig.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            massMentions: result3
                        })
                        const successMassMention = new MessageEmbed()
                            .setAuthor({ name: "Blocking Links", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("Boolean will now punish users who mass mention.")
                        return successMassMention;
                        break;
                    case "mentionscap":
                        if (Number.isNaN(parseInt(args[1]))) {
                            const helpBlockEmbed = new MessageEmbed()
                                .setAuthor({ name: "Mentions Cap", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription(`Set the cap of mentions before a user is punished.
                                **Usage:** \`!!automod mentionscap [Number]\``)
                            return helpBlockEmbed;
                        }
                        let number = parseInt(args[1])
                        automodConfig.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            maxMentions: number
                        })
                        const successMaxMention = new MessageEmbed()
                            .setAuthor({ name: "Mentions Cap", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription("The cap for mentions has been set to: `" + number + "`.")
                        return successMaxMention;
                        break;
                    case "whitelist":
                        if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(args[1])) {
                            const whitelistHelp = new MessageEmbed()
                                .setAuthor({ name: "Website Whitelist", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                                .setColor(configuration.embedColor)
                                .setDescription(`Add a website to the Website Whitelist and Boolean will ignore it.
                                **Usage:** \`!!automod whitelist [Link]\``)
                            return whitelistHelp;
                        }
                        let array = aConfig.websiteWhitelist
                        array.push(args[1])
                        automodConfig.findOneAndUpdate({
                            guildID: message.guild?.id
                        }, {
                            websiteWhitelist: array
                        })
                        const whitelistSuccess = new MessageEmbed()
                            .setAuthor({ name: "Website Whitelist", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setColor(configuration.embedColor)
                            .setDescription(`${args[1]} was added as a whitelisted website.`)
                        return whitelistSuccess;
                        break;
                    default:
                        let whitelisted = []
                        for (const whitelist of aConfig.websiteWhitelist) {
                            whitelisted.push(`\n ${whitelist}`)
                        }
                        if (whitelisted.length == 0) {
                            whitelisted.push(`None`)
                        }
                        const autoModSettings = new MessageEmbed()
                            .setAuthor({ name: "Auto-Moderation Configuration" })
                            .setDescription(`These are the configuration settings for Boolean's automoderation.
                        Run \`!!automod help\` for a list of sub commands.
                        
                        **__Settings:__**

                        > **Block Links:** \`${aConfig.blockLinks}\`
                        Boolean will automatically warn anyone who sends a link.
                        By default Discord & Tenor are added to the whitelist. But you can add your own options.

                        > **Block Scams:** \`${aConfig.blockScams}\`
                        This option allows Boolean to block Discord Nitro scams with a preset list.

                        > **Mass Mentions:** \`${aConfig.massMentions}\`
                        Boolean will block anyone who pings more than the limit. (Default limit is 3)

                        > **Mass Mention Limit:** \`${aConfig.maxMentions}\`
                        The max amount of users a user can ping before being warned.
                        
                        > **Whitelisted Websites:** ${whitelisted}`)
                            .setColor(configuration.embedColor)
                        return autoModSettings;
                }

            } else if (interaction) {

            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand