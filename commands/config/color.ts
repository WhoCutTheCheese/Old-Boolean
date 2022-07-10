import { MessageEmbed, Client, ColorResolvable, Message } from 'discord.js';
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ["color", "c"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Hex code]",
    staffPart: "Admin",
    cooldown: 0,
    userPermissions: ['MANAGE_GUILD'],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            if (guildSettings.premium === false) { return message.channel.send({ content: "This command is for premium users only! Feel free to support Boolean by buying premium!" }) }
            if (args[0] === "reset") {
                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    color: "5865F2"
                })
                const resetEmbed = new MessageEmbed()
                    .setTitle("Embed Color")
                    .setColor("5865F2" as ColorResolvable)
                    .setDescription(`Embed Color for ${message.guild?.name} has been changed to #5865F2`)
                return message.channel.send({ embeds: [resetEmbed] })
            }
            let testThing = /[0-9A-Fa-f]{6}/g;
            if (!args[0].startsWith("#")) { return message.channel.send({ content: "That is an invalid hex code!" }) }
            let testingcolor = args[0].replace('#', '').toUpperCase();
            var inputString = testingcolor;
            if (!testThing.test(inputString)) {
                return message.channel.send({ content: "That is an invalid hex code!" })
            }

            await Guild.findOneAndUpdate({
                guildID: message.guild?.id,
            }, {
                color: inputString
            })
            const resetEmbed = new MessageEmbed()
                .setTitle("Embed Color")
                .setColor(inputString as ColorResolvable)
                .setDescription(`Embed Color for ${message.guild?.name} has been changed to #${inputString}`)
            return message.channel.send({ embeds: [resetEmbed] })
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "COLOR_COMMAND", err, client, message, `${message.author.id}`, `color.ts`)
            }
        }
    },
}