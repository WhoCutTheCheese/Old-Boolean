import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
module.exports = {
    commands: ['delcase', 'unwarn'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Case Number]",
    cooldown: 1,
    userPermissions: [ "MANAGE_MESSAGES" ],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
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

        const caseDeleted = new MessageEmbed()
            .setDescription(`<:check:966796856975835197> **Case:** #${args[0]} has been deleted.`)
            .setColor(guildSettigns.color)
        await Cases.findOneAndRemove({
            guildID: message.guild?.id,
            caseNumber: args[0],
        })
        message.channel.send({ embeds: [caseDeleted] })
        ModLog(false, 0, message.guild?.id, "Case Deleted", message.author.id, message, client, Date.now())
        
    },
}