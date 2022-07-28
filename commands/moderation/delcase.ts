import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed, Permissions, TextChannel, User } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Moderation",
    description: "Delete a case.",
    slash: "both",
    aliases: ['dc'],
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
                if (warns === 0) {
                    message.channel.send({ content: "This guild does not have any cases!" })
                    return true;
                }
                if (!delCase) {
                    message.channel.send({ content: "I was unable to acquire that case." })
                    return true;
                }

                const caseDeleted = new MessageEmbed()
                    .setDescription(`<:check:966796856975835197> **Case:** #${args[0]} has been deleted.`)
                    .setColor(guildSettigns.color)
                await Cases.findOneAndRemove({
                    guildID: message.guild?.id,
                    caseNumber: args[0],
                })
                message.channel.send({ embeds: [caseDeleted] })
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Case Deleted - ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}\n> [${message.author.id}]\n<:folder:977391492790362173> **Case:** ${args[0]}\n>**Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (Number.isNaN(parseInt(args[0]))) {
                    interaction.reply({ content: "Invalid case number.", ephemeral: true })
                    return true;
                }
                const guildSettigns = await Guild.findOne({
                    guildID: interaction.guild?.id
                })
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

                const caseDeleted = new MessageEmbed()
                    .setDescription(`<:check:966796856975835197> **Case:** #${args[0]} has been deleted.`)
                    .setColor(guildSettigns.color)
                await Cases.findOneAndRemove({
                    guildID: interaction.guild?.id,
                    caseNumber: args[0],
                })
                interaction.reply({ embeds: [caseDeleted] })
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Case Deleted - ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.color)
                    .setTimestamp()
                    .setDescription(`<:user:977391493218181120> **User:** ${interaction.user.tag}\n> [${interaction.user.id}]\n<:folder:977391492790362173> **Case:** ${args[0]}\n> **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);

                if (!channel) { return; }

                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand