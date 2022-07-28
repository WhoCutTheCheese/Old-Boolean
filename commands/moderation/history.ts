import { ButtonInteraction, Interaction, GuildMember, MessageActionRow, MessageButton, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import Cases from "../../models/cases";
import Config from "../../models/config";
const _ = require("lodash");
export default {
    category: "Moderation",
    description: "View a user's history.",
    slash: "both",
    aliases: ["h"],
    maxArgs: 1,
    minArgs: 1,
    expectedArgs: "[@User/User ID]",
    cooldown: "2s",
    permissions: ["MANAGE_MESSAGES"],
    options: [
        {
            name: "user",
            description: "View this user's history.",
            required: true,
            type: "USER",
        }
    ],
    callback: async ({ message, interaction, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                let histUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!histUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return true;
                }
                let arr = [];
                const warnings = await Cases.find({
                    userID: histUser.id,
                    guildID: message.guild?.id,
                })
                for (const warn of warnings) {
                    arr.push(`\n\n**Case:** \`#${warn.caseNumber}\`\n**Type:** \`${warn.caseType}\`\n**Mod:** <@${warn.modID}>\n**Reason:** \`${warn.caseReason}\``)
                }
                const bitches = _.chunk(arr, 5)
                let numbers = 0
                if (bitches.length == 0) {
                    message.channel.send({ content: "No past punishments!" })
                    return true;
                };
                const invite = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SUCCESS")
                        .setEmoji('◀')
                        .setCustomId(`back.${message.author.id}`),
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SECONDARY")
                        .setEmoji('❌')
                        .setCustomId(`close.${message.author.id}`),
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SUCCESS")
                        .setEmoji('▶')
                        .setCustomId(`forward.${message.author.id}`),
                )
                const testEmbed = new MessageEmbed()
                    .setAuthor({ name: `${histUser.user.tag}'s History`, iconURL: histUser.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`${bitches[numbers]}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor(configuration.embedColor)
                const waitingOmgUwU = message.channel.send({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err)).then((resultMessage: any) => {
                    const filter = (Interaction: Interaction) => {
                        if (Interaction.user.id === message.author.id) return true;
                    }
                    const Buttoncollector = resultMessage.createMessageComponentCollector({
                        filter,
                        time: 15000
                    })

                    Buttoncollector.on('collect', async (i: ButtonInteraction) => {
                        await i.deferUpdate()
                        const id = i.customId
                        if (id === `back.${i.user.id}`) {
                            if (numbers === 0) { return }
                            numbers = numbers - 1;
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        } else if (id === `forward.${i.user.id}`) {
                            if (numbers === bitches.length) { return }
                            numbers = numbers + 1;
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        } else if (id === `close.${i.user.id}`) {
                            invite.components[0].setDisabled(true)
                            invite.components[1].setDisabled(true)
                            invite.components[2].setDisabled(true)
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        }
                    })
                    Buttoncollector.on('end', async (i: ButtonInteraction) => {
                        invite.components[0].setDisabled(true)
                        invite.components[1].setDisabled(true)
                        invite.components[2].setDisabled(true)
                        const testEmbed = new MessageEmbed()
                            .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`${bitches[numbers]}`)
                            .setFooter({ text: `Requested by ${message.author.tag} - Interaction Timed Out`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setColor(configuration.embedColor)
                        resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))

                    })
                }).catch((err: Error) => console.error(err))
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                let histUser = interaction.guild?.members.cache.get(args[0]);
                if (!histUser) {
                    interaction.reply({ content: "I was unable to find that user!" })
                    return true;
                }
                let arr = [];
                const warnings = await Cases.find({
                    userID: histUser.id,
                    guildID: interaction.guild?.id,
                })
                for (const warn of warnings) {
                    arr.push(`\n\n**Case:** \`#${warn.caseNumber}\`\n**Type:** \`${warn.caseType}\`\n**Mod:** <@${warn.modID}>\n**Reason:** \`${warn.caseReason}\``)
                }
                const bitches = _.chunk(arr, 5)
                let numbers = 0
                if (bitches.length == 0) {
                    interaction.reply({ content: "No past punishments!" })
                    return true;
                };
                const invite = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SUCCESS")
                        .setEmoji('◀')
                        .setCustomId(`back.${interaction.user?.id}`),
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SECONDARY")
                        .setEmoji('❌')
                        .setCustomId(`close.${interaction.user?.id}`),
                    new MessageButton()
                        .setLabel("")
                        .setStyle("SUCCESS")
                        .setEmoji('▶')
                        .setCustomId(`forward.${interaction.user?.id}`),
                )
                interaction.reply("Getting that user's stats...")
                const testEmbed = new MessageEmbed()
                    .setAuthor({ name: `${histUser.user.tag}'s History`, iconURL: histUser.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`${bitches[numbers]}`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true }) })
                    .setColor(configuration.embedColor)
                const waitingOmgUwU = interaction.channel?.send({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err)).then((resultMessage: any) => {
                    const filter = (Interaction: Interaction) => {
                        if (Interaction.user.id === interaction.user?.id) return true;
                    }
                    const Buttoncollector = resultMessage.createMessageComponentCollector({
                        filter,
                        time: 15000
                    })

                    Buttoncollector.on('collect', async (i: ButtonInteraction) => {
                        await i.deferUpdate()
                        const id = i.customId
                        if (id === `back.${i.user.id}`) {
                            if (numbers === 0) { return }
                            numbers = numbers - 1;
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        } else if (id === `forward.${i.user.id}`) {
                            if (numbers === bitches.length) { return }
                            numbers = numbers + 1;
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        } else if (id === `close.${i.user.id}`) {
                            invite.components[0].setDisabled(true)
                            invite.components[1].setDisabled(true)
                            invite.components[2].setDisabled(true)
                            const testEmbed = new MessageEmbed()
                                .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`${bitches[numbers]}`)
                                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                                .setColor(configuration.embedColor)
                            resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))
                        }
                    })
                    Buttoncollector.on('end', async (i: ButtonInteraction) => {
                        invite.components[0].setDisabled(true)
                        invite.components[1].setDisabled(true)
                        invite.components[2].setDisabled(true)
                        const testEmbed = new MessageEmbed()
                            .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`${bitches[numbers]}`)
                            .setFooter({ text: `Requested by ${interaction.user.tag} - Interaction Timed Out`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setColor(configuration.embedColor)
                        resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => console.error(err))

                    })
                }).catch((err: Error) => console.error(err))
            }
        } catch {
            (err: Error) => {
                console.error(err)
            }
        }

    }
} as ICommand