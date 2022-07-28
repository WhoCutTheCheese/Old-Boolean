import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Bulk delete messages.",
    slash: "both",
    aliases: ['clear', 'p'],
    permissions: ["MANAGE_MESSAGES"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Limit]",
    cooldown: "2s",
    options: [
        {
            name: "limit",
            description: 'How many messages to delete.',
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
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to delete messages! Run **!!check** to finish setting me up!" })
                    return true;
                }
                var amount = parseInt(args[0])

                if (!amount) {
                    message.channel.send({ content: "Please specify the amount of messages you want me to delete" })
                    return true;
                }
                if (amount > 100 || amount < 1) {
                    message.channel.send({ content: "Number must be between 1 - 100" })
                    return true;
                }
                let messages = await message.channel.messages.fetch({ limit: amount });
                (message.channel as TextChannel).bulkDelete(messages).catch((err: Error) => {
                    message.channel.send({ content: 'I was unable to delete those messages, this is either because of Discord limitations or an error occurred. Please contact a developer if this persists. Please try again!' })
                })


                let msg = await message.channel.send({ content: `Deleted \`${amount}\` messages` })
                setTimeout(() => {
                    msg.delete()
                }, 3000)
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Messages Purged`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                    > [${message.author.id}]
                    > [<@${message.author.id}>]
                    <:pencil:977391492916207636> **Action:** Purge
                    > [**Messages Purged:** ${amount}]
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
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    interaction.reply({ content: "I don't have permission to delete messages! Run **!!check** to finish setting me up!", ephemeral: true })
                    return true;
                }
                var amount = parseInt(args[0])

                if (!amount) {
                    interaction.reply({ content: "Please specify the amount of messages you want me to delete", ephemeral: true })
                    return true;
                }
                if (amount > 100 || amount < 1) {
                    interaction.reply({ content: "Number must be between 1 - 100", ephemeral: true })
                    return true;
                }
                let messages = await interaction.channel?.messages.fetch({ limit: amount });
                (interaction.channel as TextChannel).bulkDelete(messages!).catch((err: Error) => {
                    interaction.reply({ content: 'I was unable to delete those messages, this is either because of Discord limitations or an error occurred. Please contact a developer if this persists. Please try again!', ephemeral: true })
                })

                interaction.reply({ content: `Deleted \`${amount}\` messages`, ephemeral: true })
                const modLogEmbed = new MessageEmbed()
                    .setAuthor({ name: `Messages Purged`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(configuration.embedColor)
                    .setTimestamp()
                    .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                    > [${interaction.user.id}]
                    > [<@${interaction.user.id}>]
                    <:pencil:977391492916207636> **Action:** Purge
                    > [**Messages Purged:** ${amount}]
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