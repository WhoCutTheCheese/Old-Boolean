import { Client, Message, MessageEmbed, Permissions } from "discord.js";
const Guild = require("../../models/guild");
const Cases = require("../../models/cases");
const ModLog = require('../../functions/modlogs');
module.exports = {
    commands: ['nickname', 'nick', 'n'],
    minArgs: 2,
    expectedArgs: "[@User/User ID] [New Name || Reset]",
    cooldown: 2,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
            return message.channel.send({ content: "I don't have permission to edit nicknames! Run **!!check** to finish setting me up!" })
        }
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        let nickName = args.slice(1).join(" ")
        if (nickName.length > 32) { return message.channel.send({ content: "Max nick length reached! (32)" }) }
        let nickUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!nickUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
        if (nickUser.roles.highest.position > message.member!.roles.highest.position) { return message.channel.send({ content: "You may not issue punishments to a user higher then you." }) }

        if (args[1] === "reset") {
            const successEmbed = new MessageEmbed()
                .setTitle("Nickname Set")
                .setColor(guildSettings.color)
                .setDescription(`**${nickUser.user.tag}**'s nickname has been reset!`)
                .setTimestamp()
            nickUser.setNickname(null).catch((err) => { console.error(err) })
            ModLog(false, 0, message.guild?.id, "Nickname Reset", message.author.id, message, client, Date.now())
            message.channel.send({ embeds: [successEmbed] })
        } else {
            const successEmbed = new MessageEmbed()
                .setTitle("Nickname Set")
                .setColor(guildSettings.color)
                .setDescription(`**${nickUser.user.tag}**'s nickname has been set to **${nickName}**!`)
                .setTimestamp()
            nickUser.setNickname(nickName).catch((err) => { console.error(err) })
            ModLog(false, 0, message.guild?.id, "Nickname Edit", message.author.id, message, client, Date.now())
            message.channel.send({ embeds: [successEmbed] })
        }
    },
}