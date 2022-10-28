import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["prefix"],
    commandName: "PREFIX",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[New Prefix/reset]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable; 

        if (args[0].toLowerCase() == "reset") {

            await Settings.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                guildSettings: {
                    prefix: "!!"
                }
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You set the prefix to `!!`!")
                .setColor(color)
            message.channel.send({ embeds: [reset] })

        }

        if (args[0].length > 5) return message.channel.send({ content: "Prefixes can only be 5 characters long!" })

        await Settings.findOneAndUpdate({
            guildID: message.guild?.id
        }, {
            guildSettings: {
                prefix: args[0]
            }
        })

        const success = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> You set the prefix to \`${args[0]}\`!`)
            .setColor(color)
        message.channel.send({ embeds: [success] })


    }
}