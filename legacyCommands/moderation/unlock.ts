import { Client, ColorResolvable, EmbedBuilder, GuildChannel, GuildChannelResolvable, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Configuration from "../../models/config"

module.exports = {
    commands: ['unlock', 'ul'],
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: "(#Channel/Channel ID)",
    commandName: "UNLOCK",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })
        const color = configuration?.embedColor as ColorResolvable;

        const channel = message.mentions.channels.first() || message.guild?.channels.cache.get(args[0]);

        if (channel) {

            const locked = new EmbedBuilder()
                .setAuthor({ name: "Channel Unlocked", iconURL: message.guild?.iconURL() || undefined })
                .setColor(color)
                .setDescription(`This channel has been unlocked!.`)
                .setTimestamp();
            (channel as TextChannel).send({ embeds: [locked] })

            message.reply({ content: `**#${(channel as TextChannel).name}** has been unlocked!` })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                > [${message.author.id}]
                > [<@${message.author.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

                **Channel:** <#${(channel as TextChannel)?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel1 = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel1) { return; }
            if (message.guild?.members.me?.permissionsIn((channel as TextChannel)).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild?.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
            }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => console.error(err))
            return;

        }
        const locked = new EmbedBuilder()
            .setAuthor({ name: "Channel Unlocked", iconURL: message.guild?.iconURL() || undefined })
            .setColor(color)
            .setDescription(`This channel has been unlocked.`)
            .setTimestamp()
        message.reply({ embeds: [locked] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL() || undefined })
            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Unlock

            **Channel:** <#${message.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const modLogChannel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!modLogChannel) { return; }
        if (message.guild?.members.me?.permissionsIn(modLogChannel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (message.guild?.channels.cache.find((c: any) => c.id === modLogChannel?.id) as TextChannel).send({ embeds: [modLogs] })
        }
        ((message.channel as TextChannel).permissionOverwrites).edit((message.channel as TextChannel).guild.id, {
            SendMessages: null
        }).catch((err: Error) => console.error(err))


    },
}