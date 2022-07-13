import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, Interaction, ButtonInteraction } from "discord.js";
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
import Config from "../../models/config";
module.exports = {
    commands: [ 'automute' ],
    expectedArgs: "[Sub Command] [Value]",
    cooldown: 2,
    staffPart: "Admin",
    userPermissions: ["ADMINISTRATOR"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            const { member, guild, author, channel } = message;
            const guildSettings = await Guild.findOne({
                guildID: guild?.id,
            })
            switch(args[0]){
                case "warnsbeforemute":
                case "warnsmute":
                    const configSettings = await Config.findOne({
                        guildID: guild?.id
                    })
                    if(!configSettings.warnsBeforeMute) {
                        await Config.findOneAndUpdate({
                            guildID: guild?.id, 
                        }, {
                            warnsBeforeMute: 3
                        })
                    }
                    if(isNaN(Number.parseInt(args[1]))) {
                        return channel.send("Invalid number!")
                    }
                    await Config.findOneAndUpdate({
                        guildID: guild?.id, 
                    }, {
                        warnsBeforeMute: Number.parseInt(args[1])
                    })
                    const doneEmbed = new MessageEmbed()
                        .setAuthor({ name: "Warns Until Mute", iconURL: author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`The number of warns before a user it automatically muted has been set to **${args[1]}**`)
                        .setColor(guildSettings.color)
                    channel.send({ embeds: [doneEmbed] })
                    break;
                default:

                    const automuteHelpEmbed = new MessageEmbed()
                        .setAuthor({ name: "Auto Mute", iconURL: author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`Sub Commands for Automute.
                        
                        **warnsmute [Number]**
                        > Set the number of warns a user can recieve before they are automatically muted.`)
                        .setTimestamp()
                        .setColor(guildSettings.color)
                    channel.send({ embeds: [automuteHelpEmbed] })
            }

        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "MOD_ROLE_SET_COMMAND", err, client, message, `${message.author.id}`, `modroleset.ts`)
            }
        }
    },
}