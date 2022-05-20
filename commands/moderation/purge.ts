import { Client, Message, TextChannel } from "discord.js";
const Guild = require("../../models/guild");
module.exports = {
    commands: ['purge', 'clear'],
    minArgs: 1,
    maxArgs: 1,
    userPermission: ["MANAGE_MESSAGES"],
    expectedArgs: "[Limit]",
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        var amount = parseInt(args[0])

        if (!amount) { return message.channel.send({ content: "Please specify the amount of messages you want me to delete" }) }
        if (amount > 100 || amount < 1) { return message.channel.send({ content: "Number must be between 1 - 100" }) }

        (message.channel as TextChannel).bulkDelete(amount).catch((err: any) => {
              message.channel.send({ content: ':x: Due to Discord Limitations, I cannot delete messages older than 14 days' }) })

        let msg = await message.channel.send({ content: `Deleted \`${amount}\` messages` })
        setTimeout(() => {
            msg.delete()
        }, 3000)
    },
}