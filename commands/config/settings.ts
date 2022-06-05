import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
const Guild = require("../../models/guild");
const Cases = require("../../models/cases");
module.exports = {
    commands: ['config'],
    minArgs: 0,
    maxArgs: 3,
    expectedArgs: "[Module]",
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
                    .setColor(guildSettings.color)
                message.channel.send({ embeds: [ configEmbed ] })
                break;
        }
    },
}