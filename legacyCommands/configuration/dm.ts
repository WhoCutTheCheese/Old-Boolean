import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["dm"],
    commandName: "DM",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[true/false]",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })
        const color = configuration?.embedColor as ColorResolvable;

        if (args[0].toLowerCase() == "true" || args[0].toLowerCase() == "on") {

            await Configuration.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                dmOnPunish: true,
            })

            const yes = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:yes:979193272612298814> Boolean will now DM users when issued a punishment.")
            message.channel.send({ embeds: [yes] })

        } else if (args[0].toLowerCase() == "false" || args[0].toLowerCase() == "off") {

            await Configuration.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                dmOnPunish: false,
            })

            const yes = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:no:979193272784265217> Boolean will no longer DM users when punishment.")
            message.channel.send({ embeds: [yes] })

        }

    }
}