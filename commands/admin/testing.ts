import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Administration",
    description: "Get information about your current guild.",
    slash: "both",
    aliases: [],
    maxArgs: 0,
    cooldown: "5s",
    ownerOnly: true,
    hidden: true,

    callback: async ({ message, interaction, client }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const caseCount = await Cases.countDocuments({
                    guildID: message.guild?.id,
                })
                console.log(caseCount)
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const caseCount = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                })
                console.log(caseCount)
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand