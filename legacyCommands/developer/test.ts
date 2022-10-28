import { Client, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ['test'],
    devOnly: true,
    callback: async (client: Client, message: Message, args: string[]) => {
        
        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return;
        
        
    },
}