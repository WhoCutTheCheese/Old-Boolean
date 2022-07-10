import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from 'discord.js';
import Cases from "../../models/cases";
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
const _ = require("lodash");
module.exports = {
    commands: ['h', 'history'],
    minArgs: 1,
    cooldown: 0,
    expectedArgs: "(@User/User ID)",
    staffPart: "Mod",
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            let histUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
            if (!histUser) { return message.channel.send({ content: "I was unable to find that user!" }) }
            let arr = [];
            const warnings = await Cases.find({
                userID: histUser.id,
                guildID: message.guild?.id,
            })
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            for (const warn of warnings) {
                arr.push(`\n\n**Case:** \`#${warn.caseNumber}\`\n**Type:** \`${warn.caseType}\`\n**Mod:** <@${warn.modID}>\n**Reason:** \`${warn.caseReason}\``)
            }
            const bitches = _.chunk(arr, 5)
            let numbers = 0
            if (bitches.length == 0) { return message.channel.send({ content: "No past punishments!" }) };
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
                .setColor(guildSettings.color)
            const waitingOmgUwU = message.channel.send({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => ErrorLog(message.guild!, "HISTORY_MESSAGE", err, client, message, `${message.author.id}`, `history.ts`)).then((resultMessage: any) => {
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
                            .setColor(guildSettings.color)
                        resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => ErrorLog(message.guild!, "HISTORY_BACK_PAGE_FUNCTION", err, client, message, `${message.author.id}`, `history.ts`))
                    } else if (id === `forward.${i.user.id}`) {
                        if (numbers === bitches.length) { return }
                        numbers = numbers + 1;
                        const testEmbed = new MessageEmbed()
                            .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`${bitches[numbers]}`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setColor(guildSettings.color)
                        resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => ErrorLog(message.guild!, "HISTORY_FORWARD_PAGE_FUNCTION", err, client, message, `${message.author.id}`, `history.ts`))
                    } else if (id === `close.${i.user.id}`) {
                        invite.components[0].setDisabled(true)
                        invite.components[1].setDisabled(true)
                        invite.components[2].setDisabled(true)
                        const testEmbed = new MessageEmbed()
                            .setAuthor({ name: `${histUser?.user.tag}'s History`, iconURL: histUser?.displayAvatarURL({ dynamic: true }) })
                            .setDescription(`${bitches[numbers]}`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                            .setColor(guildSettings.color)
                        resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => ErrorLog(message.guild!, "HISTORY_FORCE_END_INTERACTION", err, client, message, `${message.author.id}`, `history.ts`))
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
                        .setColor(guildSettings.color)
                    resultMessage.edit({ embeds: [testEmbed], components: [invite] }).catch((err: Error) => ErrorLog(message.guild!, "HIASTORY_INTERACTION_END", err, client, message, `${message.author.id}`, `history.ts`))

                })
            }).catch((err: Error) => ErrorLog(message.guild!, "HISTORY_THEN_FUNCTION", err, client, message, `${message.author.id}`, `history.ts`))
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "HISTORY_COMMAND", err, client, message, `${message.author.id}`, `history.ts`)
            }
        }
    },
}
