import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["color", "c", "colour"],
    commandName: "COLOR",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Hex Code]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;    

        if (settings?.guildSettings?.premium === false) return message.channel.send({ content: "This guild requires premium to use this command!" })

        if (args[0].toLowerCase() == "reset") {

            await Settings.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                guildSettings: {
                    $unset: { embedColor: "" }
                }
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> Boolean's embed color has been reset!")
                .setColor("5865F2" as ColorResolvable)
            message.channel.send({ embeds: [reset] })

        }


        if (!args[0]?.toLowerCase().startsWith("#")) return message.channel.send({ content: "Invalid hex code! EX. `#000000`" })

        const embedColor = args[0].replace("#", "");

        if (!/[0-9A-Fa-f]{6}/g.test(embedColor)) return message.channel.send({ content: "Invalid hex code! EX. `#000000`" })

        await Settings.findOneAndUpdate({
            guildID: message.guild?.id
        }, {
            guildSettings: {
                embedColor: embedColor
            }
        })

        const success = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> You set the embed color to \`#${embedColor}\`!`)
            .setColor(embedColor as ColorResolvable)
        message.channel.send({ embeds: [success] })



    }
}
