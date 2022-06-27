import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['case', 'findcase', 'lookup'],
    minArgs: 1,
    expectedArgs: "[Case Number]",
    cooldown: 1,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
        if(Number.isNaN(parseInt(args[0]))) { return message.channel.send({ content: "Invalid case number." }) }
        const guildSettigns = await Guild.findOne({
            guildID: message.guild?.id
        })
        const delCase = await Cases.findOne({
            guildID: message.guild?.id,
            caseNumber: args[0],
        })
        const warns = await Cases.countDocuments({
            guildID: message.guild?.id,
        })
        if(warns === 0) { return message.channel.send({ content: "This guild does not have any cases!" }) }
        if(!delCase) { return message.channel.send({ content: "I was unable to acquire that case." }) }
        const caseInfo = new MessageEmbed()
            .setTitle(`Case #${args[0]}`)
            .setColor(guildSettigns.color)
            .setDescription(`Case against <@${delCase.userID}>`)
            .addField("Case Information", `**Mod:** <@${delCase.modID}>\n**Case Type:** ${delCase.caseType}\n**Reason:** ${delCase.caseReason}\n**Date:** <t:${Math.round(delCase.date / 1000)}:D>`)
            .setFooter({ text: `Requesred by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
        message.channel.send({ embeds: [caseInfo] })
    } catch { (err: Error) => {
        ErrorLog(message.guild!, "CASE_COMMAND", err, client, message, `${message.author.id}`, `case.ts`)
    }}
    },
}