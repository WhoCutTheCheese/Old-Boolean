import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ['purge', 'p', 'clear'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Limit]",
    commandName: "PURGE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ManageMessages])) return message.channel.send({ content: "I require `Manage Messages` to bulk delete!" })

        if (isNaN(Number(args[0]))) return message.channel.send({ content: "Invalid limit provided." })

        const limit = Number(args[0])

        if (limit > 100 || limit < 1) return message.channel.send({ content: "Limit must be greater than 1 and less than 100" })

        let messages = await message.channel?.messages.fetch({ limit: limit });

        (message.channel as TextChannel)?.bulkDelete(messages!).catch((err: Error) => { message.channel?.send({ content: "Cannot delete messages over 14 days old!" }); })

        let msg = await message.channel.send({ content: "Deleted **" + limit + "** messages" })

        setTimeout(() => {
            msg?.delete();
        }, 3000)

        const modLogEmbed = new EmbedBuilder()
            .setAuthor({ name: `Messages Purged`, iconURL: message.author.displayAvatarURL() || undefined })
            .setThumbnail(message.author.displayAvatarURL() || null)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setTimestamp()
            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Purge
            > [**Messages Purged:** ${limit}]

            **Channel:** <#${message.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel);
        if (!channel) { return; }
        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })


    },
}