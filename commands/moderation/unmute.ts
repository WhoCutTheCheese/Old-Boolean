import { Client, Message, MessageEmbed, UserResolvable, Permissions, User, GuildMember } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
import Bans from "../../models/ban";
import Config from "../../models/config"
const ms = require("ms");
module.exports = {
    commands: ['unmute', 'um'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason || Days) {Reason}",
    cooldown: 2,
    staffPart: "Mod",
    userPermissions: ["BAN_MEMBERS"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                return message.channel.send({ content: "I don't have permission to remove bans! Run **!!check** to finish setting me up!" })
            }
            const configSettings = await Config.findOne({
                guildID: message.guild?.id
            })
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            let banUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
            if (banUser?.id === message.author.id) { return message.channel.send({ content: "You're not muted..." }) }
            if(!banUser) return message.channel.send({ content: "User now found!" })
            if(configSettings.muteRoleID === "None") {
                if (banUser?.communicationDisabledUntil) {
                    banUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                    const warnEmbed = new MessageEmbed()
                        .setDescription(`<:arrow_right:967329549912248341> **${banUser.displayName}** has been unmuted!`)
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [warnEmbed] })
                } else {
                    return message.channel.send("User is not muted!")
                }
            }
            if (banUser?.roles.cache.has(configSettings.muteRoleID)) {
                banUser.roles.remove(configSettings.muteRoleID).catch((err: Error) => console.log(err))
                const warnEmbed = new MessageEmbed()
                    .setDescription(`<:arrow_right:967329549912248341> **${banUser.displayName}** has been unmuted!`)
                    .setColor(guildSettings.color)
                message.channel.send({ embeds: [warnEmbed] })

            } else if (banUser?.communicationDisabledUntil) {
                banUser.timeout(0, "untimeout").catch((err: Error) => console.log(err))
                const warnEmbed = new MessageEmbed()
                    .setDescription(`<:arrow_right:967329549912248341> **${banUser.displayName}** has been unmuted!`)
                    .setColor(guildSettings.color)
                message.channel.send({ embeds: [warnEmbed] })
            } else {
                return message.channel.send({ content: "User is not muted." })
            }

        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "UNMUTE_COMMAND", err, client, message, `${message.author.id}`, `unban.ts`)
            }
        }

    },
}