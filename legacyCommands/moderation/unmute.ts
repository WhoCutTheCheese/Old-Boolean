import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Configuration from "../../models/config"

module.exports = {
    commands: ['unmute', 'um', 'untimeout'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[@User/User ID]",
    commandName: "UNMUTE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid user!" })

        if (user.isCommunicationDisabled()) {
            user.timeout(null)
            const unmuted = new EmbedBuilder()
                .setColor(configuration?.embedColor as ColorResolvable)
                .setDescription(`**${user.user.tag}** has been unmuted!`)
            message.channel.send({ embeds: [unmuted] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Unmuted - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Unmute

                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(configuration?.embedColor as ColorResolvable)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel) { return; }
            if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            return;
        }

        if (user.roles.cache.has(configuration?.muteRoleID!)) {
            user.roles.remove(configuration?.muteRoleID!)
            const unmuted = new EmbedBuilder()
                .setColor(configuration?.embedColor as ColorResolvable)
                .setDescription(`**${user.user.tag}** has been unmuted!`)
            message.channel.send({ embeds: [unmuted] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Unmuted - ${user.user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Unmute

                **Channel:** <#${message.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(configuration?.embedColor as ColorResolvable)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel) { return; }
            if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            return;
        }

        message.channel.send({ content: `\`${user.user.tag}\` is not muted!` })


    },
}