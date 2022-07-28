import { ICommand } from "wokcommands";
import { ButtonInteraction, ColorResolvable, MessageActionRow, MessageButton, MessageEmbed, Interaction } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
import Tokens from "../../models/tokens";
export default {
    category: "Administration",
    description: "Delete all cases.",
    aliases: ["deleteallcases", "delete=all=cases"],
    slash: false,
    maxArgs: 0,
    cooldown: "5s",


    callback: async ({ message, client, args }) => {
        try {
            const configuration = await Config.findOne({
                guildID: message.guild?.id
            })
            if (message.author.id !== message.guild?.ownerId) { return message.channel.send({ content: "You cannot use this!" }) }
            const invite = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("CONFIRM")
                    .setStyle("DANGER")
                    .setCustomId(`confirm.${message.author.id}`),
            )
            const deleteallcasesEmbed = new MessageEmbed()
                .setTitle("Delete All Cases?")
                .setColor(configuration.embedColor)
                .setDescription("**WARNING** This will delete all case files stored by Boolean. This means that Boolean will NOT be able to fetch old punishments after clicking confirm.")
            message.channel.send({ embeds: [deleteallcasesEmbed], components: [invite] }).then((resultMessage: any) => {
                const filter = (Interaction: Interaction) => {
                    if (Interaction.user.id === message.author.id) return true;
                }
                const Buttoncollector = resultMessage.createMessageComponentCollector({
                    filter,
                    time: 15000
                })

                Buttoncollector.on('collect', async (i: ButtonInteraction) => {
                    await i.deferUpdate()
                    const id = i.customId
                    if (id === `confirm.${i.user.id}`) {
                        invite.components[0].setDisabled(true)
                        const deleteallcasesEmbed = new MessageEmbed()
                            .setTitle("Delete All Cases")
                            .setColor(configuration.embedColor)
                            .setDescription("Boolean has deleted all case files in this guild!")
                        resultMessage.edit({ embeds: [deleteallcasesEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        await Cases.deleteMany({
                            guildID: message.guild?.id,
                        })
                        await Guild.updateOne({
                            guildID: message.guild?.id,
                        }, {
                            totalCases: 0,
                        })
                    }
                })
            }).catch((err: Error) => console.error(err))
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand