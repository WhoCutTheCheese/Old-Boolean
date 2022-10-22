import { Client, ColorResolvable, EmbedBuilder, Message, TextChannel } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["modlogs"],
    commandName: "MODLOGS",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "[Set/Reset/View] [@Channel/Channel ID]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable; 

        const channel = message.mentions.channels.first() || message.guild?.channels.cache.get(args[1])

        switch (args[0].toLowerCase()) {
            case "set":

                if (!channel) return message.channel.send({ content: "Invalid channel! Ex. `!!modlogs set #Channel`" })

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modSettings: {
                        modLogChannel: channel.id
                    }
                })

                const success = new EmbedBuilder()
                    .setDescription("<:yes:979193272612298814> You set the mod logging channel to `#" + (channel as TextChannel).name + "`!")
                    .setColor(color)
                message.channel.send({ embeds: [success] })

                break;
            case "reset":

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modSettings: {
                        $unset: { modLogChannel: "" }
                    }
                })

                const reset = new EmbedBuilder()
                    .setDescription("<:no:979193272784265217> You reset the mod logging channel!")
                    .setColor(color)
                message.channel.send({ embeds: [reset] })


                break;
            case "view":


                let channelE
                if(!settings.modSettings?.modLogChannel) {
                    channelE = "None"
                } else {
                    channelE = `<#${settings.modSettings?.modLogChannel}>`
                }
    
                const view = new EmbedBuilder()
                    .setTitle("Mod Log Channel")
                    .setColor(color)
                    .setDescription(`**Current Channel:** ${channelE}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [view] })

                break;

        }

    }
}
