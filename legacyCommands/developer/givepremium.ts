import { Client, Message } from "discord.js";
import Tokens from "../../models/tokens";

module.exports = {
    commands: ['givepremium'],
    devOnly: true,
    callback: async (client: Client, message: Message, args: string[]) => {

        if(message.author.id !== "493453098199547905") return;
    
        const tokens = await Tokens.findOne({
            userID: message.author.id
        })

        switch (args[0].toLowerCase()) {
        
            case "createfile":

                const user = message.mentions.users.first() || client.users.cache.get(args[1]);
                if(!user) return message.channel.send({ content: "No user provided!" })

                const newTokens = new Tokens({
                    userID: user.id,
                    userName: user.tag,
                    tokens: 0
                });
                newTokens.save();

                message.channel.send({ content: `Created a file for \`${user.tag}\`!` })

                break;
            case "add":

                const user2 = message.mentions.users.first() || client.users.cache.get(args[1]);
                if(!user2) return message.channel.send({ content: "No user provided!" })

                if(!tokens) return message.channel.send({ content: "You must make a file!" });

                if(isNaN(Number(args[2]))) return message.channel.send({ content: "Not a number!" })

                await Tokens.findOneAndUpdate({
                    userID: user2.id,
                }, {
                    tokens: tokens.tokens! + Number(args[2])
                });

                message.channel.send({ content: `Gave \`${args[2]}\` to \`${user2.tag}\`` })



                break;

        }
    }
}