import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["muterole"],
    commandName: "MUTEROLE",
    commandCategory: "CONFIGURATION",
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "[Set/Reset/View] [@Role/Role ID]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[1])

        switch (args[0].toLowerCase()) {
            case "set":

                if (!role) return message.channel.send({ content: "Invalid role! Ex. `!!muterole set @Role`" })

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    muteRoleID: role.id
                })

                const success = new EmbedBuilder()
                    .setDescription("<:yes:979193272612298814> You set the mute role to `" + role.name + "`!")
                    .setColor(color)
                message.channel.send({ embeds: [success] })

                break;
            case "reset":

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    muteRoleID: "None"
                })

                break;
            case "view":


                let roleE
                if(configuration?.muteRoleID == "None") {
                    roleE = "None"
                } else {
                    roleE = `<@&${configuration?.muteRoleID}>`
                }
    
                const view = new EmbedBuilder()
                    .setTitle("Mute Role")
                    .setColor(color)
                    .setDescription(`**Current Role:** ${roleE}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [view] })

                break;

        }

    }
}
