import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from 'discord.js'
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['test'],
    maxArgs: 0,
    minargs: 0,
    cooldown: 0,
    devOnly: true,
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        const exDate = new Date();
        exDate.setMinutes(exDate.getMinutes() - 100)
        if(exDate < new Date()) { console.log("Yes.") }
    },
}