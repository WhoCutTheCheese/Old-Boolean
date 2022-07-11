import { Client, Message, MessageEmbed } from "discord.js";
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['botinfo', 'bot'],
    minArgs: 0,
    maxArgs: 0,
    cooldown: 5,
    callback: async (client: Client, bot: { version: string; }, message: Message, args: string[]) => {
        try {
            const serverSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            const botInfo = new MessageEmbed()
                .setAuthor({ name: "Boolean Info", iconURL: client.user?.displayAvatarURL({ dynamic: true }) })
                .setColor(serverSettings.color)
                .addField("<:discovery:996115763842785370> Name:", `\`${client.user?.username}\``, true)
                .addField("<:stage:996115761703702528> Team:", `\`Creator:\` <@493453098199547905>\n\`Contributor:\` <@648598769449041946>`, true)
                .addField("<:blurple_shield:996115768154525827> Guilds:", `\`${client.guilds.cache.size}\``, true)
                .addField("<:gears:996115762848747530> Created:", `<t:${Math.floor(client.user!.createdAt.getTime() / 1000)}:D>`, true)
                .addField("<:staff:996115760579620974> Version:", `\`v${bot.version}\``, true)
                .addField("<:thread:996116357269692526> Library:", `\`discord.js\``, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            message.channel.send({ embeds: [botInfo] })
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "BOTINFO_COMMAND", err, client, message, `${message.author.id}`, `botinfo.ts`)
            }
        }
    },
}