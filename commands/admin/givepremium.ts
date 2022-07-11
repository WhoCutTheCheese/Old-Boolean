import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from 'discord.js'
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
import Tokens from "../../models/tokens";
module.exports = {
    commands: ['givepremium'],
    maxArgs: 2,
    minargs: 1,
    cooldown: 0,
    devOnly: true,
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        if (message.author.id !== "493453098199547905") return
        let person = message.mentions.members!.first() || message.guild?.members.cache.get(args[1])
        if (!args[1]) return
        const settings = await Tokens.findOne({
            userID: person?.id
        })
        if(Number.isNaN(args[1])) { return }
        if (!settings){
            const newTokens = await new Tokens({
                userID: person?.id,
                guildID: "None",
                guildName: "None",
                tokens: args[1],
            })
            newTokens.save()
                .catch((err: Error) => console.error(err));
            message.channel.send("Gave that dude premium yea")
        }
        if (settings) {
            const tokensUwU = await Tokens.findOne({
                userID: person?.id
            })
            const number = tokensUwU.tokens += parseInt(args[1]);
            await Tokens.findOneAndUpdate({
                userID: person?.id,
            }, {
                userID: person?.id,
                guildID: "None",
                guildName: "None",
                tokens: number,
            })
            message.channel.send("Gave that dude premium yea")
        }
    },
}