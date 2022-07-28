import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Change a case reason.",
    slash: "both",
    aliases: ['r'],
    permissions: ["MANAGE_MESSAGES"],
    minArgs: 1,
    expectedArgs: "[Case Number]",
    cooldown: "2s",
    options: [
        {
            name: "case",
            description: 'Case ID.',
            required: true,
            type: 'NUMBER',
        }, {
            name: "reason",
            description: "New case reason.",
            required: true,
            type: "STRING",
        }
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
                const caseFind = await Cases.findOne({
                    guildID: message.guild?.id,
                    caseNumber: args[0],
                })
                const caseCount = await Cases.countDocuments({
                    guildID: message.guild?.id,
                })
                if (caseCount === 0) {
                    message.channel.send({ content: "This guild does not have any cases!" })
                    return true;
                }
                if (!caseFind) {
                    message.channel.send({ content: "I was unable to acquire that case." })
                    return true;
                }
                if (!args[1]) {
                    message.channel.send({ content: "Enter a new reason." })
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (reason.length > 250) {
                    message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                    return true;
                }

                await Cases.findOneAndUpdate({
                    guildID: message.guild?.id,
                    caseNumber: args[0],
                }, {
                    caseReason: reason,
                })
                const successEmbed = new MessageEmbed()
                    .setTitle(`Case #${caseFind.caseNumber}`)
                    .setColor(configuration.embedColor)
                    .setDescription(`**Case reason has been updated to**: ${reason}`)
                    .setTimestamp()
                message.channel.send({ embeds: [successEmbed] })
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Case Reason Edited`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
                    <:pencil:977391492916207636> **Action:** Reason
                    > [**Case:** ${caseFind.caseNumber}]
                    > [**New Case Reason:** ${reason}]
                    **Channel:** <#${message.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
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
                const caseFind = await Cases.findOne({
                    guildID: interaction.guild?.id,
                    caseNumber: args[0],
                })
                const caseCount = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                })
                if (caseCount === 0) {
                    interaction.reply({ content: "This guild does not have any cases!", ephemeral: true })
                    return true;
                }
                if (!caseFind) {
                    interaction.reply({ content: "I was unable to acquire that case.", ephemeral: true })
                    return true;
                }
                if (!args[1]) {
                    interaction.reply({ content: "Enter a new reason.", ephemeral: true })
                    return true;
                }
                let reason = args.slice(1).join(" ")
                if (reason.length > 250) {
                    interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                    return true;
                }

                await Cases.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                    caseNumber: args[0],
                }, {
                    caseReason: reason,
                })
                const successEmbed = new MessageEmbed()
                    .setTitle(`Case #${caseFind.caseNumber}`)
                    .setColor(configuration.embedColor)
                    .setDescription(`**Case reason has been updated to**: ${reason}`)
                    .setTimestamp()
                interaction.reply({ embeds: [successEmbed] })
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Case Reason Edited`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                    > [${interaction.user.id}]
                    > [<@${interaction.user.id}>]
                    <:pencil:977391492916207636> **Action:** Reason
                    > [**Case:** ${caseFind.caseNumber}]
                    > [**New Case Reason:** ${reason}]
                    **Channel:** <#${interaction.channel?.id}>
                    **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
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