import { Client, Message, MessageEmbed, UserResolvable, Permissions, User } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
import Bans from "../../models/ban";
const ms = require("ms");
module.exports = {
    commands: ['unban', 'ub'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason || Days) {Reason}",
    cooldown: 2,
    staffPart: "Mod",
    userPermissions: ["BAN_MEMBERS"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                return message.channel.send({ content: "I don't have permission to remove bans! Run **!!check** to finish setting me up!" })
            }
            let banUser = await client.users.fetch(args[0]).catch((err) => message.channel.send({ content: "Unknown user!" }).then(() => console.log(err)));
            if (banUser?.id === message.author.id) { return message.channel.send({ content: "You're not banned..." }) }
            message.guild.members.unban(banUser!.id).then((user: any) => {
                ModLog(true, 0, message.guild?.id, "Unban", message.author.id, message, client, Date.now())
                return message.channel.send("Member unbanned!")
            }).catch((err: Error) => {
                return message.channel.send("Member is not banned or doesn't exist!")
            })
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "BAN_COMMAND", err, client, message, `${message.author.id}`, `ban.ts`)
            }
        }

    },
}