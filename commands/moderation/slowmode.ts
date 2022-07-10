import { Client, Message, MessageEmbed, TextChannel, Permissions } from "discord.js";
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['slowmode', 'slow', 'cooldown'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Time-frame]",
    cooldown: 1,
    staffPart: "Mod",
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                return message.channel.send({ content: "I don't have permission to edit slowmode! Run **!!check** to finish setting me up!" })
            }
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            if (Number.isNaN(parseInt(args[0]))) { return message.channel.send({ content: "Invalid time-frame" }) }
            if (parseInt(args[0]) > 21600 || parseInt(args[0]) < 0) { return message.channel.send({ content: "Invalid time-frame" }) }
            (message.channel as TextChannel).setRateLimitPerUser(parseInt(args[0])).catch((err: Error) => ErrorLog(message.guild!, "RATE_LIMIT_FUNCTION", err, client, message, `${message.author.id}`, `slowmode.ts`))
            const successEmbed = new MessageEmbed()
                .setDescription(`<:arrow_right:967329549912248341> Slowmode has been set to **${args[0]} second(s)**!`)
                .setColor(guildSettings.color)
            message.channel.send({ embeds: [successEmbed] })
            ModLog(false, 0, message.guild?.id, "Slowmode", message.author.id, message, client, Date.now())
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "SLOWMODE_COMMAND", err, client, message, `${message.author.id}`, `slowmode.ts`)
            }
        }
    },
}