import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";
import GuildProperties from "../../models/guild";

module.exports = {
    commands: ["color", "c", "colour"],
    commandName: "COLOR",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Hex Code]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })

        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id,
        })

        if (guildProp?.premium === false) return message.channel.send({ content: "This guild requires premium to use this command!" })

        if (args[0].toLowerCase() == "reset") {

            await Configuration.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                embedColor: "5865F2"
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You set the embed color to `#5865F2`!")
                .setColor("5865F2" as ColorResolvable)
            message.channel.send({ embeds: [reset] })

        }


        if (!args[0]?.toLowerCase().startsWith("#")) return message.channel.send({ content: "Invalid hex code! EX. `#000000`" })

        const embedColor = args[0].replace("#", "");

        if (!/[0-9A-Fa-f]{6}/g.test(embedColor)) return message.channel.send({ content: "Invalid hex code! EX. `#000000`" })

        await Configuration.findOneAndUpdate({
            guildID: message.guild?.id
        }, {
            embedColor: embedColor
        })

        const success = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> You set the embed color to \`#${embedColor}\`!`)
            .setColor(embedColor as ColorResolvable)
        message.channel.send({ embeds: [success] })



    }
}
