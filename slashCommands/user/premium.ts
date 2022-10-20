import { SlashCommandBuilder, Client, PermissionsBitField, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Tokens from "../../models/tokens";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("View, redeem, and revoke premium from the current guild!")
        .addStringOption(string =>
            string.setName("subcommand")
                .setRequired(false)
                .setDescription("What action would you like to take.")
                .addChoices(
                    { name: "View Balance", value: "balance" },
                    { name: "View Status", value: "status" },
                    { name: "Redeem Premium", value: "redeem" },
                    { name: "Revoke Premium", value: "revoke" }
                )
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "You can only use this command in a guild!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })

        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id
        })
        const tokens = await Tokens.findOne({
            userID: interaction.user.id
        })

        const subCommand = interaction.options.getString("subcommand");

        switch (subCommand) {
            case "redeem":

                if (!tokens || tokens.tokens == 0) return interaction.reply({ content: "Your token balance is 0!", ephemeral: true })

                if (guildProp?.premium == true) return interaction.reply({ content: "This guild already has premium enabled!", ephemeral: true })

                await GuildProperties.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    premium: true,
                    premiumHolder: interaction.user.id
                })

                await Tokens.findOneAndUpdate({
                    userID: interaction.user.id
                }, {
                    tokens: tokens.tokens! - 1
                })

                const enabledPremium = new EmbedBuilder()
                    .setAuthor({ name: "Thank You!", iconURL: interaction.user.displayAvatarURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have successfully enabled premium for this guild! You can revoke premium at any time.`)
                    .setTimestamp()
                interaction.reply({ embeds: [enabledPremium] })
                break;
            case "revoke":

                if (guildProp?.premiumHolder !== interaction.user.id || guildProp.premium == false) return interaction.reply({ content: "You cannot revoke premium!", ephemeral: true })

                await GuildProperties.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    premium: false,
                    premiumHolder: "None"
                })

                await Tokens.findOneAndUpdate({
                    userID: interaction.user.id
                }, {
                    tokens: tokens?.tokens! + 1
                })

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    embedColor: "5865F2"
                })

                const disable = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:no:979193272784265217> You have revoked premium and your token has been refunded.`)
                interaction.reply({ embeds: [disable] })

                break;
            case "status":

                let holder
                if (guildProp?.premium == false) {
                    holder = "None"
                } else {
                    holder = `<@${guildProp?.premiumHolder}>`
                }
                const status = new EmbedBuilder()
                    .setAuthor({ name: "Premium Status" })
                    .setColor(color)
                    .setDescription(`**Premium:** ${guildProp?.premium}
                    **Premium Holder:** ${holder}`)
                    .setTimestamp()
                interaction.reply({ embeds: [status] })

                break;
            case "balance":

                let array: string[] = []
                const enabledServer = await GuildProperties.find({
                    premiumHolder: interaction.user.id
                })
                for (const servers of enabledServer) {
                    let guild = client.guilds.cache.get(servers.guildID!)
                    array.push(`\n> ${guild?.name}`)
                }
                if (array.length == 0) array.push("None")

                let tokensNumber
                if (!tokens) {
                    tokensNumber = 0
                } else {
                    tokensNumber = tokens.tokens
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Your Balance", iconURL: interaction.user.displayAvatarURL() || undefined })
                    .setColor(color)
                    .setDescription(`**Token Balance:** ${tokensNumber}
                    **Enabled Servers:**${array}
                    
                    __**Premium Perks:**__
                    > <:trash:1020778790982533241> **Removal of all plugs/ads**
                    > :tada: **Extra giveaway checks** [COMING SOON] *giveaway command not done yet :D*
                    > <:stem:1020779802703171635>[3 additional blacklist and bonus entry roles]
                    > <:stem:1020779802703171635>[Message number check]
                    > <:stem:1020779802703171635>[Removal of watermark on giveaway entry]
                    > <:indent:1020778495644803132>[Claim button that opens ticket when giveaway ends]
                    > <:tasklist:967443053063327774> **Message counting**
                    > <:log:1020779324804190320> **Full audit logging**
                    > :coin: **10 Maximum Permits**`)
                interaction.reply({ embeds: [embed] })

                break;
            default:
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Buy Now!")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://google.com")
                            .setDisabled(true)
                    )
                const embed2 = new EmbedBuilder()
                    .setTitle("Boolean Premium")
                    .setColor(color)
                    .setDescription(`__**Premium Perks:**__
                    > <:trash:1020778790982533241> **Removal of all plugs/ads**
                    > :tada: **Extra giveaway checks** [COMING SOON] *giveaway command not done yet :D*
                    > <:stem:1020779802703171635>[3 additional blacklist and bonus entry roles]
                    > <:stem:1020779802703171635>[Message number check]
                    > <:stem:1020779802703171635>[Removal of watermark on giveaway entry]
                    > <:indent:1020778495644803132>[Claim button that opens ticket when giveaway ends]
                    > <:tasklist:967443053063327774> **Message counting**
                    > <:log:1020779324804190320> **Full audit logging**
                    > :coin: **10 Maximum Permits**`)
                    .setFooter({ text: "Premium not available at this time!" })
                interaction.reply({ embeds: [embed2], components: [row] })
        }

    }
}