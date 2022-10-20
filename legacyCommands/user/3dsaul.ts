import { Client, Message } from "discord.js";
let set = new Set()

module.exports = {
    commands: ["3dsaul", "whyarewestillhere"],
    callback: async (client: Client, message: Message, args: string[]) => {
        if(set.has(message.author.id)) return;
        message.reply("https://media.discordapp.net/attachments/819578916275617804/977631812413161502/lv_0_20220516161756.mp4")
        set.add(message.author.id)
    }
}