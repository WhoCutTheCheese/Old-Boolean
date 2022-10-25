import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ["joinrole"],
    commandName: "JOINROLE",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
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

                if (!role) return message.channel.send({ content: "Invalid role! Ex. `!!joinrole set @Role`" })

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    joinRoleID: role.id
                })

                const success = new EmbedBuilder()
                    .setDescription("<:yes:979193272612298814> You set the join role to `" + role.name + "`!")
                    .setColor(color)
                message.channel.send({ embeds: [success] })

                break;
            case "reset":

                await Configuration.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    joinRoleID: "None"
                })

                break;
            case "view":


                let roleE
                if(configuration?.joinRoleID == "None") {
                    roleE = "None"
                } else {
                    roleE = `<@&${configuration?.joinRoleID}>`
                }
    
                const view = new EmbedBuilder()
                    .setTitle("Join Role")
                    .setColor(color)
                    .setDescription(`**Current Role:** ${roleE}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [view] })

                break;

        }

    }
}
