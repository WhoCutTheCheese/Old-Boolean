import { ICommand } from "wokcommands";

export default {
    category: "User",
    description: "Bot latency!",
    slash: "both",
    maxArgs: 0,

    callback: async ({ channel, client, message, interaction }) => {
        try {
            let reply
            if (message) {
                await message.reply({ content: "🔃 Calculating..." }).then(resultMessage => {
                    const ping = resultMessage.createdTimestamp - message.createdTimestamp
                    resultMessage.edit({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
                })
            } else if (interaction) {
                await interaction.deferReply();
                await interaction.channel?.send({ content: "🔃 Calculating..." }).then(resultMessage => {
                    const ping = resultMessage.createdTimestamp - interaction.createdTimestamp
                    resultMessage.edit({ content: `<:check:966796856975835197> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` })
                })
            }
        } catch {
            ((err: Error) => {
                console.log(err)
                return true;
            })
        }


    }
} as ICommand