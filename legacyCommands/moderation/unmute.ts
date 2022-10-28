import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Settings from "../../models/settings"

module.exports = {
    commands: ['unmute', 'um', 'untimeout'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[@User/User ID]",
    commandName: "UNMUTE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid user!" })

        if (user.isCommunicationDisabled()) {
            user.timeout(null).catch((err: Error) => {
                console.error(err)
                message.channel.send({ content: "I could not unmute this user!" })});
            const unmuted = new EmbedBuilder()
                .setColor(color)
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
                .setColor(color)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true;
            if (!channel) { exists = false; }
            if (exists == true) {
                if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }
            return;
        }

        if (user.roles.cache.has(settings.modSettings?.muteRole!)) {
            user.roles.remove(settings.modSettings?.muteRole!).catch((err: Error) => {
                console.error(err)
                message.channel.send({ content: "I could not unmute this user!" })});
            const unmuted = new EmbedBuilder()
                .setColor(color)
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
                .setColor(color)
                .setTimestamp()
            const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (message.guild?.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }
            return;
        }

        message.channel.send({ content: `\`${user.user.tag}\` is not muted!` })


    },
}