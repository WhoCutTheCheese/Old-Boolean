import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["muterole"],
    commandName: "MUTEROLE",
    commandCategory: "CONFIGURATION",
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "[Set/Reset/View] [@Role/Role ID]",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable; 

        const role = message.mentions.roles.first() || message.guild?.roles.cache.get(args[1])

        switch (args[0].toLowerCase()) {
            case "set":

                if (!role) return message.channel.send({ content: "Invalid role! Ex. `!!muterole set @Role`" })

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modSettings: {
                        muteRole: role.id
                    }
                })

                const success = new EmbedBuilder()
                    .setDescription("<:yes:979193272612298814> You set the mute role to `" + role.name + "`!")
                    .setColor(color)
                message.channel.send({ embeds: [success] })

                break;
            case "reset":

                await Settings.findOneAndUpdate({
                    guildID: message.guild?.id
                }, {
                    modSettings: {
                        $unset: { muteRole: "" }
                    }
                })

                
                const reset = new EmbedBuilder()
                    .setDescription("<:no:979193272784265217> You reset the mute role!")
                    .setColor(color)
                message.channel.send({ embeds: [reset] })

                break;
            case "view":


                let roleE
                if(!settings.modSettings?.muteRole) {
                    roleE = "None"
                } else {
                    roleE = `<@&${settings.modSettings?.muteRole}>`
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
