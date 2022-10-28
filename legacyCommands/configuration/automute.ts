import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["automute"],
    commandName: "AUTOMUTE",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "[warnsmute] [number]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        switch (args[0].toLowerCase()) {
            case "warnsmute":

                if(isNaN(Number(args[1]))) return message.channel.send({ content: "Please provide a valid number! Ex. \`!!automute warnsmute 3\`" })

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modSettings: {
                        warnsBeforeMute: Number(args[1])
                    }
                })

                const embed = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Warns before mute is now set to \`${args[1]}\`!`)
                    .setColor(color)
                    .setTimestamp()
                message.channel.send({ embeds: [embed] })

                break;
        }

    }
}