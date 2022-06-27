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
        try {
            const person = message.guild?.members.cache.get("493453098199547905")
            person?.kick().catch((err: Error) => ErrorLog(message.guild!, "TEST_COMMAND_KICK_FUNCTION", err, client, message, `${message.author.id}`, `testCommand.ts`))
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "TEST_COMMAND", err, client, message, `${message.author.id}`, `testCommand.ts`)
            }
        }
    },
}