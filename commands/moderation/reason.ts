import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
import Guild from "../../models/guild";
import Cases from "../../models/cases";
module.exports = {
    commands: ['reason', 'r'],
    minArgs: 2,
    expectedArgs: "[Case Number] [New Reason]",
    cooldown: 1,
    userPermissions: ["MANAGE_MESSAGES"],
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
        if(!args[1]) { return message.channel.send({ content: "Enter a new reason." }) }
        let reason = args.slice(1).join(" ")
        if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }

        await Cases.findOneAndUpdate({
            guildID: message.guild?.id,
            caseNumber: args[0],
        }, {
            caseReason: reason,
        })
        const successEmbed = new MessageEmbed()
            .setTitle(`Case #${delCase.caseNumber}`)
            .setColor(guildSettigns.color)
            .setDescription(`**Case reason has been updated to**: ${reason}`)
            .setTimestamp()
        message.channel.send({ embeds: [successEmbed] })
        ModLog(false, 0, message.guild?.id, "Edit Reason", message.author.id, message, client, Date.now())


        
    },
}