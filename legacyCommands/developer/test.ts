import { Client, Message } from "discord.js";
import Settings from "../../models/settings";
import { Punishment } from "../../classes/punish";

module.exports = {
    commands: ['test'],
    devOnly: true,
    callback: async (client: Client, message: Message, args: string[]) => {
        

    message.channel.send({ content: "Nothing here for you, Espeon." })        
        
    },
}