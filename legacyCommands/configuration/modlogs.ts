import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["modlogs"],
    commandName: "MODLOGS",
    commandCategory: "CONFIGURATION",
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "[Set/Reset/View] [#Channel/Channel ID]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[1])

        switch (args[0].toLowerCase()) {
            case "set":

                if (!role) return message.channel.send({ content: "Invalid channel! Ex. `!!modlogs set #Channel`" })

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modLogChannel: role.id
                })

                const success = new EmbedBuilder()
                    .setDescription("<:yes:979193272612298814> You set the mod logging channel to `" + role.name + "`!")
                    .setColor(color)
                message.channel.send({ embeds: [success] })

                break;
            case "reset":

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modLogChannel: "None"
                })

                break;
            case "view":


                let roleE
                if(configuration?.modLogChannel == "None") {
                    roleE = "None"
                } else {
                    roleE = `<#${configuration?.modLogChannel}>`
                }
    
                const view = new EmbedBuilder()
                    .setTitle("Mod Log Channel")
                    .setColor(color)
                    .setDescription(`**Current Channel:** ${roleE}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [view] })

                break;

        }

    }
}
