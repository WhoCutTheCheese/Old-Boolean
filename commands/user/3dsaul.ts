import { ICommand } from "wokcommands";
export default {
    category: "User",
    description: "Browwwwwww bo be no no no WOWW",
    slash: false,
    aliases: ['whyarewestillhere', 'breakingpoint', 'bean'],
    minArgs: 0,
    maxArgs: 0,
    expectedArgs: "",
    cooldown: "5s",
    hidden: true,

    callback: async ({ message }) => {
        if(message) {
            message.reply("https://media.discordapp.net/attachments/819578916275617804/977631812413161502/lv_0_20220516161756.mp4")
        }
    }
} as ICommand