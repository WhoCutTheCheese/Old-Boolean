import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
module.exports = {
    commands: ['ping', 'p', 'latency'],
    minArgs: 0,
    maxArgs: 0,
    expectedArgs: "",
    cooldown: 1,
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        await message.reply({ content: "🔃 Calculating..." }).then(resultMessage => {
            const ping = resultMessage.createdTimestamp - message.createdTimestamp
            resultMessage.edit({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
        })        
    },
}