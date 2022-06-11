import { Client, MessageEmbed, Message } from 'discord.js';
import Guild from "../../models/guild";
module.exports = {
    commands: ['av', 'avatar', 'pfp'],
    minArgs: 0,
    maxArgs: 1,
    cooldown: 3,
    expectedArgs: ['(@User/User ID)'],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        const gSettings = await Guild.findOne({
            guildID: message.guild?.id
        })
        let user = message.mentions.members?.first() || message.guild?.members.cache.get(args[1]);
        if (!args[0]) {
            const av = new MessageEmbed()
                .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor(gSettings.color)
                .setImage(`${message.author.displayAvatarURL({ size: 512, dynamic: true })}`)
            return message.channel.send({ embeds: [av] })
        }
        if (!user) { return message.channel.send({ content: "Invalid User" }); }
        const av = new MessageEmbed()
            .setAuthor({ name: `${user.user.tag}`, iconURL: user.user.displayAvatarURL({ dynamic: true }) })
            .setColor(gSettings.color)
            .setImage(`${user.user.displayAvatarURL({ size: 512, dynamic: true })}`)
        message.channel.send({ embeds: [av] })
    }
}