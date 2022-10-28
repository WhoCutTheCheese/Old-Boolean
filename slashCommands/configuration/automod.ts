import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Edit automod settings.")
        .addStringOption(choice =>
            choice.setName("sub_command")
                .setRequired(true)
                .setDescription("Chose what action you would like to take.")
                .addChoices(
                    { name: "Block Links", value: "blocklinks" },
                    { name: "Block Scam", value: "blockscam" },
                    { name: "Mass Mentions", value: "massmention" },
                    { name: "Mass Mentions Cap", value: "mentionscap" },
                    { name: "Website Whitelist", value: "whitelist" },
                    { name: "Invite Blocking", value: "blockinvites" },
                    { name: "View Current Settings", value: "help" }
                )
        )
        .addBooleanOption(boolean =>
            boolean.setName("boolean")
                .setDescription("Enable or disable any automod modules.")
                .setRequired(false)
        )
        .addStringOption(string =>
            string.setName("website")
                .setDescription("Input a website URL to add to the whitelist.")
                .setRequired(false)
                .addChoices(
                    { name: "Add Website", value: "add" },
                    { name: "Remove Website", value: "remove" },
                    { name: "Clear Filter", value: "clear" }
                )

        )
        .addNumberOption(number =>
            number.setName("cap")
                .setDescription("Set the threshold for mass mentions")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("whitelist_option")
                .setDescription("Enter the subcommand you would like to use for the website whitelist.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if (permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if (hasRole == true) break;
        }

        for (const permit of permits) {
            if (permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("AUTOMOD") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("AUTOMOD") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subCommand = interaction.options.getString("sub_command")
        const boolean = interaction.options.getBoolean("boolean")
        const website = interaction.options.getString("website")
        const mentionsCap = interaction.options.get("cap")
        const option = interaction.options.getString("whitelist_option")

        switch (subCommand) {
            case "blockinvites":

                if (!boolean) return interaction.reply({ content: "Please provide a boolean value!", ephemeral: true })
                if (boolean == true) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            blockInvites: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Invite blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else if (boolean == false) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockInvites: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Invite blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else return interaction.reply({ content: "Invalid argument! Ex. `!!automod Invite Blocking true/false`", ephemeral: true })

                break;
            case "blocklinks":

                if (!boolean) return interaction.reply({ content: "Please provide a boolean value!", ephemeral: true })
                if (boolean == true) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            blockLinks: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Link blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else if (boolean == false) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockLinks: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Link blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else return interaction.reply({ content: "Invalid argument! Ex. `!!automod Block Links true/false`", ephemeral: true })
                break;
            case "blockscam":

                if (!boolean) return interaction.reply({ content: "Please provide a boolean value!", ephemeral: true })
                if (boolean == true) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            blockScams: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Scam blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else if (boolean == false) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { blockScams: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Scam blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else return interaction.reply({ content: "Invalid argument! Ex. `/automod Block Scams true/false`", ephemeral: true })


                break;
            case "massmention":

                if (!boolean) return interaction.reply({ content: "Please provide a boolean value!", ephemeral: true })
                if (boolean == true) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            massMentions: true
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Mass mention blocking is now \`enabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else if (boolean == false) {
                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { massMentions: "" }
                        }
                    })
                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Mass mention blocking is now \`disabled\`!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                } else return interaction.reply({ content: "Invalid argument! Ex. `/automod Mass Mentions true/false`", ephemeral: true })


                break;
            case "mentionscap":

                if (!mentionsCap) return interaction.reply({ content: "Invalid threshold provided! Ex. `/automod Mass Mentions Caps 3`", ephemeral: true })

                await Settings.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    autoModSettings: {
                        maxMentions: mentionsCap
                    }
                })

                const mentionsCapEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have mass mention cap to \`${mentionsCap}\``)
                interaction.reply({ embeds: [mentionsCapEmbed] })

                break;
            case "whitelist":

                if (option == "add") {
                    if(!website) return interaction.reply({ content: "You must provide a valid website! Ex. `/automod Website Whitelist add https://google.com`", ephemeral: true })
                    if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(website)) return interaction.reply({ content: "Invalid website provided! Ex. `!!automod whitelist add https://google.com`", ephemeral: true })

                    if (settings.autoModSettings?.websiteWhitelist.includes(website)) return interaction.reply({ content: "This website is already whitelisted!", ephemeral: true })

                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $push: { websiteWhitelist: website }
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Added \`${website}\` to the website filter bypass!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })

                } else if (option == "remove") {
                    if(!website) return interaction.reply({ content: "You must provide a valid website! Ex. `/automod Website Whitelist add https://google.com`", ephemeral: true })
                    if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(website)) return interaction.reply({ content: "Invalid website provided! Ex. `/automod Website Whitelist add https://google.com`" })

                    let websiteFilter
                    if (settings.autoModSettings?.websiteWhitelist) {
                        websiteFilter = settings.autoModSettings?.websiteWhitelist
                    } else return interaction.reply({ content: "No websites are whitelisted.", ephemeral: true })
                    const whitelistIndex = websiteFilter.indexOf(website)

                    if (whitelistIndex > -1) {
                        websiteFilter.splice(whitelistIndex, 1)
                    }

                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            websiteWhitelist: websiteFilter
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Removed \`${website}\` from the website filter bypass!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })


                } else if (option == "clear") {

                    await Settings.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        autoModSettings: {
                            $unset: { whitelist: "" }
                        }
                    })

                    const embed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Cleared the website filter!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })

                } else return interaction.reply({ content: "Invalid argument! Ex. `/automod Website Whitelist add/remove/clear (Website)`", ephemeral: true })


                break;
            case "help":

                if (!settings.autoModSettings) return interaction.reply({ content: "You have no settings saved!", ephemeral: true })
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
                interaction.reply({ embeds: [helpEmbed] })

                break;
        }

    }
}