import { Client, Collection, Interaction, Permissions, MessageEmbed } from 'discord.js';
const Guild = require('../../models/guild');
module.exports = {
    commands: ['av', 'avatar', 'pfp'],
    minArgs: 0,
    maxArgs: 1,
    cooldown: 3,
    expectedArgs: ['(@User/User ID)'],
    callback: async (client: any, bot: any, message: { guild: { id: any; members: { cache: { get: (arg0: any) => any; }; }; }; mentions: { members: { first: () => any; }; }; author: { tag: any; displayAvatarURL: (arg0: { dynamic: boolean; size?: number; }) => any; }; channel: { send: (arg0: { embeds?: any[]; content?: string; }) => void; }; }, args: any[], text: any) => {
        const gSettings = await Guild.findOne({
            guildID: message.guild.id
        })
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
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