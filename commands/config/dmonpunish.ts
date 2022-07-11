import { Client, Message, MessageEmbed } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['dmonpunish'],
    minArgs: 1,
    maxArgs: 1,
    cooldown: 10,
    expectedArgs: "[Boolean (true/false)]",
    staffPart: "Admin",
    userPermissions: ["ADMINISTRATOR"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const configSettings = await Config.findOne({
                guildID: message.guild?.id
            })
            if(args[0] == "true") {
                if(configSettings.dmOnPunish === true) { return message.channel.send("Boolean will already DM people when they are punished.") }
                await Config.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    dmOnPunish: true
                })
                return message.channel.send("Boolean will now DM people on punishment.")
            } else if(args[0] == "false") {
                if(configSettings.dmOnPunish === false) { return message.channel.send("Boolean already does not DM people on punishment.") }
                await Config.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    dmOnPunish: false
                })
                return message.channel.send("Boolean will not DM people on punishment.")
            } else {
                return message.channel.send("Not a boolean (true/false)")
            }
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "CONFIG_COMMAND", err, client, message, `${message.author.id}`, `config.ts`)
            }
        }
    },
}