import { Client, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ['test'],
    devOnly: true,
    callback: async (client: Client, message: Message, args: string[]) => {
        
        message.reply({ content: "Nothing to test here, Espeon." })
        
    },
}