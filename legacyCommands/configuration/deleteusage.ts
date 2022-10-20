import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["deleteusage", "du"],
    commandName: "DELETEUSAGE",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[true/false]",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration =  await Configuration.findOne({
            guildID: message.guild?.id,
        })
        const color = configuration?.embedColor as ColorResolvable;

        if (args[0].toLowerCase() == "true" || args[0].toLowerCase() == "on") {

            await Configuration.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                deleteCommandUsage: true,
            })

            const yes = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:yes:979193272612298814> Boolean will now delete legacy command usage after `3 seconds`.")
            message.channel.send({ embeds: [yes] })

        } else if (args[0].toLowerCase() == "false" || args[0].toLowerCase() == "off") {
                
                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    deleteCommandUsage: false,
                })
    
                const yes = new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<:no:979193272784265217> Boolean will no longer delete legacy command usage.")
                message.channel.send({ embeds: [yes] })
    
            }

    }
}