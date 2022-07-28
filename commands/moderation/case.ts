import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "View a case.",
    slash: "both",
    aliases: ['c'],
    minArgs: 1,
    expectedArgs: "[Case Number]",
    permissions: ["MANAGE_MESSAGES"],
    cooldown: "2s",
    options: [
        {
            name: "case",
            description: 'Case ID.',
            required: true,
            type: 'NUMBER',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (Number.isNaN(parseInt(args[0]))) {
                    message.channel.send({ content: "Invalid case number." })
                    return true;
                }
                const delCase = await Cases.findOne({
                    guildID: message.guild?.id,
                    caseNumber: args[0],
                })
                const warns = await Cases.countDocuments({
                    guildID: message.guild?.id,
                })
                if (warns === 0) {
                    message.channel.send({ content: "This guild does not have any cases!" })
                    return true;
                }
                if (!delCase) {
                    message.channel.send({ content: "I was unable to acquire that case." })
                    return true;
                }
                const caseInfo = new MessageEmbed()
                    .setTitle(`Case #${args[0]}`)
                    .setColor(configuration.embedColor)
                    .setDescription(`Case against <@${delCase.userID}>`)
                    .addField("Case Information", `**Mod:** <@${delCase.modID}>\n**Case Type:** ${delCase.caseType}\n**Reason:** ${delCase.caseReason}\n**Date:** <t:${Math.round(delCase.date / 1000)}:D>`)
                    .setFooter({ text: `Requesred by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                message.channel.send({ embeds: [caseInfo] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (Number.isNaN(parseInt(args[0]))) {
                    interaction.reply({ content: "Invalid case number.", ephemeral: true })
                    return true;
                }
                const delCase = await Cases.findOne({
                    guildID: interaction.guild?.id,
                    caseNumber: args[0],
                })
                const warns = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                })
                if (warns === 0) {
                    interaction.reply({ content: "This guild does not have any cases!", ephemeral: true })
                    return true;
                }
                if (!delCase) {
                    interaction.reply({ content: "I was unable to acquire that case.", ephemeral: true })
                    return true;
                }
                const caseInfo = new MessageEmbed()
                    .setTitle(`Case #${args[0]}`)
                    .setColor(configuration.embedColor)
                    .setDescription(`Case against <@${delCase.userID}>`)
                    .addField("Case Information", `**Mod:** <@${delCase.modID}>\n**Case Type:** ${delCase.caseType}\n**Reason:** ${delCase.caseReason}\n**Date:** <t:${Math.round(delCase.date / 1000)}:D>`)
                    .setFooter({ text: `Requesred by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    interaction.reply({ embeds: [caseInfo] })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand