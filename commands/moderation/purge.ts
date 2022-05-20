import { Client } from "discord.js";
const Guild = require("../../models/guild");
module.exports = {
    commands: ['purge', 'clear'],
    minArgs: 1,
    maxArgs: 1,
    userPermission: ["MANAGE_MESSAGES"],
    expectedArgs: "[Limit]",
    callback: async (client: Client, bot: any, message: any, args: string[]) => {
        var amount = parseInt(args[0])

        if (!amount) return message.channel.send("Please specify the amount of messages you want me to delete")
        if (amount > 100 || amount < 1) return message.channel.send("Please select a number *between* 100 and 1")

        message.channel.bulkDelete(amount).catch((err: any) => {
              message.channel.send(':x: Due to Discord Limitations, I cannot delete messages older than 14 days') })

        let msg = await message.channel.send(`Deleted \`${amount}\` messages`)
        setTimeout(() => {
            msg.delete()
        }, 3000)
    },
}