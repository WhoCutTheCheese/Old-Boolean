import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
module.exports = {
    commands: ['whyarewestillhere', 'breakingpoint', '3dsaul'],
    minArgs: 0,
    maxArgs: 0,
    expectedArgs: "",
    cooldown: 1,
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        message.reply("https://media.discordapp.net/attachments/819578916275617804/977631812413161502/lv_0_20220516161756.mp4")       
    },
}