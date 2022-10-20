import { Client, ColorResolvable, EmbedBuilder, Message, User } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    commands: ['case', 'viewcase'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Case Number]",
    commandName: "CASE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {
        
        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })

        if(isNaN(Number(args[0]))) return message.channel.send({ content: "Invalid case number!" });

        const foundCase = await Cases.findOne({
            guildID: message.guild?.id,
            caseNumber: args[0]
        })

        if(!foundCase) return message.channel.send({ content: "This case does not exist." })

        let userUwU = await client.users.fetch(foundCase.userID!).catch((err: Error) => console.log(err))
        let username : string
        if(!userUwU) userUwU = client.user as User; username = `<@${foundCase.userID}>`
        username = userUwU.tag

        const caseInfo = new EmbedBuilder()
            .setAuthor({ name: `Case #${foundCase.caseNumber}`, iconURL: userUwU?.displayAvatarURL() || undefined })
            .setThumbnail(userUwU?.displayAvatarURL() || null)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setDescription(`Case against <@${foundCase.userID}>
            
            **__Case Details:__**
            > **Moderator:** <@${foundCase.modID!}>
            > **User:** ${username} (${foundCase.userID})
            > **Case Reason:** ${foundCase.caseReason}
            > **Case Type:** ${foundCase.caseType}
            > **Case Length:** ${foundCase.caseLength}
            > **Case Date:** <t:${Math.round(foundCase.caseDate as any / 1000)}:D>`)
            .setTimestamp()
        message.channel.send({ embeds: [caseInfo] })

    },
}