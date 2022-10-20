import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["automute"],
    commandName: "AUTOMUTE",
    commandCategory: "CONFIGURATION",
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "[warnsmute] [number]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })

        switch (args[0].toLowerCase()) {
            case "warnsmute":

                if(isNaN(Number(args[1]))) return message.channel.send({ content: "Please provide a valid number! Ex. \`!!automute warnsmute 3\`" })

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    warnsBeforeMute: Number(args[1])
                })

                const embed = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Warns before mute is now set to \`${args[1]}\`!`)
                    .setColor(configuration?.embedColor as ColorResolvable)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] })

                break;
        }

    }
}