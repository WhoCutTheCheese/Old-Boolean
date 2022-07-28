import { ICommand } from "wokcommands";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Tokens from "../../models/tokens";
export default {
    category: "Administration",
    description: "Give a user premium.",
    slash: false,
    aliases: [],
    maxArgs: 0,
    cooldown: "5s",
    ownerOnly: true,
    hidden: true,

    callback: async ({ message, interaction, client, args }) => {
        try {
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
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand