import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, User } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    commands: ["unban", "ub", "removeban"],
    minArgs: 1,
    expectedArgs: "[User ID]",
    commandName: "UNBAN",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.BanMembers])) return message.channel.send({ content: "I require the `Ban Members` to remove bans!" });

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        let awd
        const user = await client.users.fetch(args[0]).catch((err: Error) => {
            message.channel.send({ content: "Invalid User! Or this user is not banned!" })
            awd = true
        })
        if (awd == true) return;
        if (!user) return message.channel.send({ content: "Invalid User!" })
        if (!message.guild.bans.cache.get(user.id)) return message.channel.send({ content: "User is not banned!" })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `User Unbanned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]

            <:pencil:977391492916207636> **Action:** Unban
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (message.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

        message.guild.bans.remove(user.id)

        const unbanEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(`**${user?.tag}** has been unbanned!`)
        return message.channel.send({ embeds: [unbanEmbed] })


    }
}