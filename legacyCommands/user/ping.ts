import { Client, Message } from "discord.js";
module.exports = {
    commands: ['ping', 'latency'],
    callback: async (client: Client, message: Message, args: string[]) => {
        const pingMessage = await message.channel.send({ content: "🔃 Calculating..." })
        const ping = pingMessage.createdTimestamp - message.createdTimestamp
        pingMessage.edit({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })     
    },
}