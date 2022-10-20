import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    commands: ['delcase', 'dc'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Case Number]",
    commandName: "DELCASE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })

        if (isNaN(Number(args[0]))) return message.channel.send({ content: "Invalid case number!" });

        const foundCase = await Cases.findOne({
            guildID: message.guild?.id,
            caseNumber: args[0]
        })

        if (!foundCase) return message.channel.send({ content: "This case does not exist." })

        await Cases.findOneAndDelete({
            guildID: message.guild?.id,
            caseNumber: args[0]
        })

        const caseDeleted = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> Deleted case \`#${args[0]}\``)
            .setColor(configuration?.embedColor as ColorResolvable)
        message.channel.send({ embeds: [caseDeleted] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Case Deleted`, iconURL: message.author.displayAvatarURL() || undefined })
            .setThumbnail(message.author.displayAvatarURL() || null)
            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Case Delete
            > [**Case Number:** #${args[0]}]

            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!channel) { return; }
        if (message.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
        }

    },
}