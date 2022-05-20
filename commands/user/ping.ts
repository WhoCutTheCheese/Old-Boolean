module.exports = {
    commands: ['ping', 'latency', 'p'],
    minArgs: 0,
    maxArgs: 0,
    callback: async (client: { ws: { ping: any } }, bot: any, message: { reply: (arg0: { content: string }) => Promise<any>; createdTimestamp: number }, args: any, text: any) => {
        const pingMessage = await message.reply({ content: "🔃 Calculating..." }).then(resultMessage => {
            const ping = resultMessage.createdTimestamp - message.createdTimestamp
            resultMessage.edit({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
        })
    },
}