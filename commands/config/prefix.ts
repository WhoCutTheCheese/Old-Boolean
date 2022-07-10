import { MessageEmbed, Client, Message } from 'discord.js';
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
const ModLog = require("../../functions/modlogs");
module.exports = {
    commands: ["prefix", "p"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Prefix]",
    cooldown: 10,
    staffPart: "Admin",
    userPermissions: ['MANAGE_GUILD'],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const settings = await Guild.findOne({
                guildID: message.guild?.id
            });

            if (args[0] === "reset") {
                await settings.updateOne({
                    prefix: "!!"
                })
                const resetPrefix = new MessageEmbed()
                    .setTitle("Prefix")
                    .setColor(settings.color)
                    .setDescription("Guild prefix has been updated to `!!`")
                    .setTimestamp()
                message.channel.send({ embeds: [resetPrefix] })
                ModLog(false, 0, message.guild?.id, "Prefix Changed", message.author.id, message, client, Date.now())

            } else {
                if (args[0].length > 3) {
                    return message.channel.send({ content: "Prefix exceeds character limit (3)" })
                } else {
                    await settings.updateOne({
                        prefix: args[0]
                    });
                    const setPrefix = new MessageEmbed()
                        .setTitle("Prefix")
                        .setColor(settings.color)
                        .addField("Prefix Updated", `Guild prefix has been updated to \`${args[0]}\``)
                        .setTimestamp()
                    message.channel.send({ embeds: [setPrefix] });
                    ModLog(false, 0, message.guild?.id, "Prefix Changed", message.author.id, message, client, Date.now())

                }
            }
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "PREFIX_COMMAND", err, client, message, `${message.author.id}`, `prefix.ts`)
            }
        }
    },
}