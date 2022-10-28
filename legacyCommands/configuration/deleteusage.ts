import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["deleteusage", "du"],
    commandName: "DELETEUSAGE",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[true/false]",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable; 

        if (args[0].toLowerCase() == "true" || args[0].toLowerCase() == "on") {
            await Settings.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                modSettings: {
                    deleteCommandUsage: true
                }
            })
            const embed = new EmbedBuilder()
                .setDescription(`<:yes:979193272612298814> Boolean will now delete legacy command usage!`)
                .setColor(color)
                .setTimestamp()
            message.channel.send({ embeds: [embed] })
        } else if (args[0].toLowerCase() == "false" || args[0].toLowerCase() == "off") {
            await Settings.findOneAndUpdate({
                guildID: message.guild?.id
            }, {
                autoModSettings: {
                    $unset: { deleteCommandUsage: "" }
                }
            })
            const embed = new EmbedBuilder()
                .setDescription(`<:no:979193272784265217> Boolean will no longer delete legacy command usage!`)
                .setColor(color)
                .setTimestamp()
            message.channel.send({ embeds: [embed] })
        } else return message.channel.send({ content: "Invalid argument! Ex. `!!deleteusage true/false`" })
    }
}