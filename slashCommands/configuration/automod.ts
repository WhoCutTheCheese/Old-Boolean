import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import AConfig from "../../models/automodConfig"
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

        )
        .addNumberOption(number =>
            number.setName("cap")
                .setDescription("Set the threshold for mass mentions")
                .setRequired(false)

        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const automodConfig = await AConfig.findOne({
            guildID: interaction.guild.id
        })

        if(!automodConfig) {
            const newAutomodConfig = new AConfig({
                guildID: interaction.guild?.id,
                blockLinks: false,
                blockScams: false,
                massMentions: false,
                maxMentions: 3,
                websiteWhitelist: ["https://youtube.com", "https://tenor.com", "https://cdn.discordapp.com", "https://discord.com", "media.discordapp.net"],
            })
            newAutomodConfig.save().catch((err: Error) => {console.log(err)})
            return interaction.reply({ content: "Creating configuration file... Please run this command again!", ephemeral: true })
        }

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if(permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if(hasRole == true) break;
        }

        for (const permit of permits) {
            if(permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if(thePermit?.commandAccess.includes("AUTOMOD") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("AUTOMOD") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subCommand = interaction.options.getString("sub_command")
        const boolean = interaction.options.getBoolean("boolean")
        const website = interaction.options.getString("website")
        const mentionsCap = interaction.options.get("cap")

        switch (subCommand) {
            case "blocklinks":

                if (!boolean) return interaction.reply({ content: "Invalid option provided! EX. true/false", ephemeral: true })

                await AConfig.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    blockLinks: boolean
                })

                const blockLinksEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have set link blocking to \`${boolean}\``)
                interaction.reply({ embeds: [blockLinksEmbed] })

                break;
            case "blockscam":

                if (!boolean) return interaction.reply({ content: "Invalid option provided! EX. true/false", ephemeral: true })

                await AConfig.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    blockScams: boolean
                })

                const blockScamEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have set scam link blocking to \`${boolean}\``)
                interaction.reply({ embeds: [blockScamEmbed] })

                break;
            case "massmention":

                if (!boolean) return interaction.reply({ content: "Invalid option provided! EX. true/false", ephemeral: true })

                await AConfig.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    massMentions: boolean
                })

                const massMentionEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have mass mention blocking to \`${boolean}\``)
                interaction.reply({ embeds: [massMentionEmbed] })

                break;
            case "mentionscap":

                if (!mentionsCap) return interaction.reply({ content: "Invalid threshold provided!", ephemeral: true })

                await AConfig.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    maxMentions: mentionsCap
                })

                const mentionsCapEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have mass mention cap to \`${mentionsCap}\``)
                interaction.reply({ embeds: [mentionsCapEmbed] })

                break;
            case "whitelist":

                if (!website) return interaction.reply({ content: "Invalid website provided! EX. https://google.com", ephemeral: true })
                if (!/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(website)) return interaction.reply({ content: "Invalid website provided! EX. https://google.com", ephemeral: true })

                await AConfig.findOneAndUpdate({
                    guildID: interaction.guild?.id
                }, {
                    $push: { websiteWhitelist: website }
                })

                const whitelistEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You added \`${website}\` to the website whitelist!`)
                interaction.reply({ embeds: [whitelistEmbed] })

                break;
            case "help":

                let whitelisted : string[] = []
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
                interaction.reply({ embeds: [helpEmbed] })

                break;
        }

    }
}