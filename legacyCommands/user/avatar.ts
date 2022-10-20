import { Client, ColorResolvable, EmbedBuilder, GuildMember, Message, User } from "discord.js";
import Configuration from "../../models/config"

module.exports = {
    commands: ['avatar', 'av', 'pfp'],
    maxArgs: 1,
    expectedArgs: "(@User/User ID)",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;

        if (!args[0]) {

            const userInfoAuthor = new EmbedBuilder()
                .setAuthor({ name: `${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                .setImage(message.author?.displayAvatarURL({ size: 512 }) || null)
                .setColor(color)
                .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
            message.channel.send({ embeds: [userInfoAuthor] })
        } else {
            let user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await client.users.fetch(args[0]).catch((err) => message.channel.send({ content: "Unknown user!" }).then(() => console.log(err)));
            if (!user) return message.channel.send({ content: "Invalid user!" });

            let foundInServer = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => {
                user = user as User
                const userInfoAuthor = new EmbedBuilder()
                    .setAuthor({ name: `${user.tag}`, iconURL: user?.avatarURL() || undefined })
                    .setImage(user?.displayAvatarURL({ size: 512 }) || null)
                    .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                message.channel.send({ embeds: [userInfoAuthor] })
            });
            if (foundInServer) {
                user = foundInServer
                const userInfoAuthor = new EmbedBuilder()
                    .setAuthor({ name: `${user.user?.tag}`, iconURL: user.user?.avatarURL() || undefined })
                    .setImage(user.user?.displayAvatarURL({ size: 512 }) || null)
                    .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                message.channel.send({ embeds: [userInfoAuthor] })
            }
        }

    }
}