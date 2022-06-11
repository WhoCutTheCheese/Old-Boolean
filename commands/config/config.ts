import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
module.exports = {
    commands: ['config', 'settings'],
    minArgs: 0,
    maxArgs: 0,
    cooldown: 10,
    userPermissions: [ "ADMINISTRATOR", "MANAGE_GUILD" ],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        switch(args[0]){
            default:
                const configEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message.guild?.name} Configuration Help`, iconURL: message.guild?.iconURL({ dynamic: true }) || "https://i.imgur.com/m8E4zzv.png" })
                    .setDescription("")
                    .setColor(guildSettings.color)
                message.channel.send({ embeds: [ configEmbed ] })
                break;
        }
    },
}