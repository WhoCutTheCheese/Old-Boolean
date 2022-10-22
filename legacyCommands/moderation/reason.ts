import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Settings from "../../models/settings";
import Cases from "../../models/cases";

module.exports = {
    commands: ['reason', 'casereason', 'r'],
    minArgs: 2,
    expectedArgs: "[Case Number] [New Reason]",
    commandName: "REASON",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;


        if (isNaN(Number(args[0]))) return message.channel.send({ content: "Invalid case number!" });

        let reason = args.splice(1).join("  ")
        if (!reason) return message.channel.send({ content: "Invalid reason!" })

        const foundCase = await Cases.findOne({
            guildID: message.guild?.id,
            caseNumber: args[0]
        })

        if (!foundCase) return message.channel.send({ content: "This case does not exist." })

        await Cases.findOneAndUpdate({
            guildID: message.guild?.id,
            caseNumber: args[0]
        }, {
            caseReason: reason
        })

        const caseUpdated = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> Case \`#${args[0]}\`'s reason has been set to \`${reason}\``)
            .setColor(color)
        message.channel.send({ embeds: [caseUpdated] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Case Updated`, iconURL: message.author.displayAvatarURL() || undefined })
            .setThumbnail(message.author.displayAvatarURL() || null)
            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Case Update
            > [**Old Reason:** ${foundCase.caseReason}]
            > [**New Reason:** ${reason}]

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

    },
}