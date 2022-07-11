import { Client, Message, MessageEmbed, Permissions } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['modlog', 'ml'],
    minArgs: 0,
    maxArgs: 0,
    expectedArgs: "",
    staffPart: "Admin",
    cooldown: 10,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {

        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "MOD_LOG_SET_COMMAND", err, client, message, `${message.author.id}`, `modlogset.ts`)
            }
        }
    },
}