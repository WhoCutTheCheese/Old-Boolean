import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed, Permissions, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Change a user's nickname.",
    slash: "both",
    aliases: ['c'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] [New Nickname]",
    permissions: ["MANAGE_MESSAGES"],
    cooldown: "2s",
    options: [
        {
            name: "user",
            description: 'User to change their nick.',
            required: true,
            type: 'USER',
        }, {
            name: "nickname",
            description: "New nickname.",
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
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
                    message.channel.send({ content: "I don't have permission to edit nicknames! Run **!!check** to finish setting me up!" })
                    return;
                }
                let nickName = args.slice(1).join(" ")
                if (nickName.length > 32) {
                    message.channel.send({ content: "Max nick length reached! (32)" })
                    return;
                }
                let nickUser = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
                if (!nickUser) {
                    message.channel.send({ content: "I was unable to find that user!" })
                    return;
                }
                if (nickUser.roles.highest.position > message.member!.roles.highest.position) {
                    message.channel.send({ content: "You may not issue punishments to a user higher then you." })
                    return;
                }

                if (args[1] === "reset") {
                    const successEmbed = new MessageEmbed()
                        .setTitle("Nickname Set")
                        .setColor(configuration.embedColor)
                        .setDescription(`**${nickUser.user.tag}**'s nickname has been reset!`)
                        .setTimestamp()
                    nickUser.setNickname(null).catch((err: Error) => console.error(err))
                    message.channel.send({ embeds: [successEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Username Updated - ${nickUser.user.tag}`, iconURL: nickUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(nickUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${nickUser.user.tag}
                        > [${nickUser.user.id}]
                        > [<@${nickUser.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Nickname
                        > [**New Nickname:** #${nickUser.user.tag}]]
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                } else {
                    const successEmbed = new MessageEmbed()
                        .setTitle("Nickname Set")
                        .setColor(configuration.embedColor)
                        .setDescription(`**${nickUser.user.tag}**'s nickname has been set to **${nickName}**!`)
                        .setTimestamp()
                    nickUser.setNickname(nickName).catch((err: Error) => console.error(err))
                    message.channel.send({ embeds: [successEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Username Updated - ${nickUser.user.tag}`, iconURL: nickUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(nickUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${nickUser.user.tag}
                        > [${nickUser.user.id}]
                        > [<@${nickUser.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Nickname
                        > [**New Nickname:** #${nickName}]]
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
                    interaction.reply({ content: "I don't have permission to edit nicknames! Run **!!check** to finish setting me up!" })
                    return;
                }
                let nickName = args.slice(1).join(" ")
                if (nickName.length > 32) {
                    interaction.reply({ content: "Max nick length reached! (32)", ephemeral: true })
                    return;
                }
                let nickUser = interaction.guild?.members.cache.get(args[0]);
                if (!nickUser) {
                    interaction.reply({ content: "I was unable to find that user!" })
                    return;
                }
                if (nickUser.roles.highest.position > (interaction.member as GuildMember)!.roles.highest.position) {
                    interaction.reply({ content: "You may not issue punishments to a user higher then you.", ephemeral: true })
                    return;
                }

                if (args[1] === "reset") {
                    const successEmbed = new MessageEmbed()
                        .setTitle("Nickname Set")
                        .setColor(configuration.embedColor)
                        .setDescription(`**${nickUser.user.tag}**'s nickname has been reset!`)
                        .setTimestamp()
                    nickUser.setNickname(null).catch((err: Error) => console.error(err))
                    interaction.reply({ embeds: [successEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Username Updated - ${nickUser.user.tag}`, iconURL: nickUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(nickUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${nickUser.user.tag}
                        > [${nickUser.user.id}]
                        > [<@${nickUser.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Nickname
                        > [**New Nickname:** #${nickUser.user.tag}]]
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                } else {
                    const successEmbed = new MessageEmbed()
                        .setTitle("Nickname Set")
                        .setColor(configuration.embedColor)
                        .setDescription(`**${nickUser.user.tag}**'s nickname has been set to **${nickName}**!`)
                        .setTimestamp()
                    nickUser.setNickname(nickName).catch((err: Error) => console.error(err))
                    interaction.reply({ embeds: [successEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Username Updated - ${nickUser.user.tag}`, iconURL: nickUser.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(nickUser.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${nickUser.user.tag}
                        > [${nickUser.user.id}]
                        > [<@${nickUser.user.id}>]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Nickname
                        > [**New Nickname:** #${nickName}]]
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand