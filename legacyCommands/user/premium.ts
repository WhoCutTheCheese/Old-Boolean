
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";
import GuildProperties from "../../models/guild";
import Tokens from "../../models/tokens";

module.exports = {
    minArgs: 1,
    cooldown: 3,
    expectedArgs: "[Help/Redeem/Revoke/Status/Balance]",
    commands: ['premium'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })

        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id
        })
        const tokens = await Tokens.findOne({
            userID: message.author.id
        })

        switch (args[0].toLowerCase()) {
            case "redeem":

                if (!tokens || tokens.tokens == 0) {
                    message.channel.send({ content: "Your token balance is 0!" }).then((result: Message) => {
                        setTimeout(() => {
                            if(result.deletable) {
                                result.delete
                            }
                        }, 3000)
                    })
                    return;
                }

                if (guildProp?.premium == true)  {
                    message.channel.send({ content: "This guild already has premium enabled!" }).then((result: Message) => {
                        setTimeout(() => {
                            if(result.deletable) {
                                result.delete
                            }
                        }, 3000)
                    })
                    return;
                }

                await GuildProperties.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    premium: true,
                    premiumHolder: message.author.id
                })

                await Tokens.findOneAndUpdate({
                    userID: message.author.id
                }, {
                    tokens: tokens.tokens! - 1
                })

                const enabledPremium = new EmbedBuilder()
                    .setAuthor({ name: "Thank You!", iconURL: message.author.displayAvatarURL() || undefined })
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You have successfully enabled premium for this guild! You can revoke premium at any time.`)
                    .setTimestamp()
                message.channel.send({ embeds: [enabledPremium] })
                break;
            case "revoke":

                if (guildProp?.premiumHolder !== message.author.id || guildProp.premium == false)  {
                    message.channel.send({ content: "You cannot revoke premium!" })
                    return;
                }

                await GuildProperties.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    premium: false,
                    premiumHolder: "None"
                })

                await Tokens.findOneAndUpdate({
                    userID: message.author.id
                }, {
                    tokens: tokens?.tokens! + 1
                })

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    embedColor: "5865F2"
                })

                const disable = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:no:979193272784265217> You have revoked premium and your token has been refunded.`)
                message.channel.send({ embeds: [disable] })

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
                message.channel.send({ embeds: [status] })

                break;
            case "balance":

                let array: string[] = []
                const enabledServer = await GuildProperties.find({
                    premiumHolder: message.author.id
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
                    .setAuthor({ name: "Your Balance", iconURL: message.author.displayAvatarURL() || undefined })
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
                message.channel.send({ embeds: [embed] })

                break;
            case "help":
                let prefix = configuration?.prefix
                if(!prefix) prefix = "!!"
                const premiumHelpEmbed = new EmbedBuilder()
                    .setTitle("Premium Command")
                    .setDescription(`Help support Boolean by purchasing Boolean premium!
                    \`\`\`ml\n[] = Required Argument | () = Optional Argument\`\`\`
                    
                    **Aliases:** None
                    **Usage:** \`${prefix}premium [Help/Redeem/Revoke/Status/Balance]\`
                    > **Redeem** Spend a token to redeem premium
                    > **Revoke** Revoke your premium and return your token
                    > **Status** View the premium status of the current guild
                    > **Balance** View your premium balance`)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [premiumHelpEmbed] })

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
                message.channel.send({ embeds: [embed2], components: [row] })
        }

    },
}