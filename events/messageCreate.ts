import { Client, Message } from "discord.js";
import Settings from "../models/settings";
import performAutomod from "../functions/performAutomod";

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message: Message, client: Client) {
        performAutomod(message, client);

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) {
            if(!message.content.startsWith("!!")) return;
            const newSettings = new Settings({
                guildID: message.guild?.id,
                guildSettings: {
                    prefix: "!!",
                }
            });
            newSettings.save().catch((err: Error) => console.log(err));
        }

    }
}