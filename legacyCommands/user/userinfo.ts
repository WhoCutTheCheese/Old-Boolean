import { Client, ColorResolvable, EmbedBuilder, GuildMember, Message, User } from "discord.js";
import Configuration from "../../models/config"

module.exports = {
    commands: ['userinfo', 'ui', 'user'],
    maxArgs: 1,
    expectedArgs: "(@User/User ID)",
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;

        if (!args[0]) {
            let nickname: string
            if (message.member?.nickname) {
                nickname = message.member.nickname
            } else {
                nickname = message.author.username
            }
            const userInfoAuthor = new EmbedBuilder()
                .setAuthor({ name: `${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                .setThumbnail(message.author?.displayAvatarURL() || null)
                .setColor(color)
                .addFields(
                    { name: "Name:", value: `${message.author.tag}`, inline: true },
                    { name: "Is Bot:", value: `${message.author.bot}`, inline: true },
                    { name: "General Information:", value: `**Mention:** <@${message.author?.id}>\n**ID:** ${message.author?.id}\n**Highest Role:** ${message.member?.roles.highest}\n**Avatar:** [Link](${message.author?.displayAvatarURL({ size: 512 })})\n**Display Name:** ${nickname}` },
                    { name: "🗓️ Account Joined:", value: `<t:${Math.floor(message.member?.joinedAt!.getTime()! / 1000)}:D> (<t:${Math.floor(message.member?.joinedAt!.getTime()! / 1000)}:R>)`, inline: true },
                    { name: "🗓️ Account Created:", value: `<t:${Math.floor((message.author as User).createdAt.getTime() / 1000)}:D> (<t:${Math.floor(message.author.createdAt.getTime()! / 1000)}:R>)`, inline: true },
                )
                .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
            message.channel.send({ embeds: [userInfoAuthor] })
        } else {
            let user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await client.users.fetch(args[0]).catch((err) => message.channel.send({ content: "Unknown user!" }).then(() => console.log(err)));
            if (!user) return message.channel.send({ content: "Invalid user!" });

            let foundInServer = message.mentions.members?.first() || await message.guild?.members.fetch(args[0]).catch(() => {
                user = user as User
                const userInfoAuthor = new EmbedBuilder()
                    .setAuthor({ name: `${user.tag}`, iconURL: user?.avatarURL() || undefined })
                    .setThumbnail(user?.displayAvatarURL() || null)
                    .setColor(color)
                    .addFields(
                        { name: "Name:", value: `${user.tag}`, inline: true },
                        { name: "Is Bot:", value: `${user.bot}`, inline: true },
                        { name: "General Information:", value: `**Mention:** <@${user?.id}>\n**ID:** ${user?.id}\n**Highest Role:** Not Cached/Not In Server\n**Avatar:** [Link](${user?.displayAvatarURL({ size: 512 })})\n**Display Name:** Not Cached/Not In Server` },
                        { name: "🗓️ Account Joined:", value: `Not Cached/Not In Server`, inline: true },
                        { name: "🗓️ Account Created:", value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(user.createdAt.getTime()! / 1000)}:R>)`, inline: true },
                    )
                    .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                message.channel.send({ embeds: [userInfoAuthor] })
            });
            if (foundInServer) {
                user = foundInServer
                let nickname: string
                if (user?.nickname) {
                    nickname = user.nickname
                } else {
                    nickname = user.user.username
                }
                const userInfoAuthor = new EmbedBuilder()
                    .setAuthor({ name: `${user.user?.tag}`, iconURL: user.user?.avatarURL() || undefined })
                    .setThumbnail(user.user?.displayAvatarURL() || null)
                    .setColor(color)
                    .addFields(
                        { name: "Name:", value: `${user.user.tag}`, inline: true },
                        { name: "Is Bot:", value: `${user.user.bot}`, inline: true },
                        { name: "General Information:", value: `**Mention:** <@${user.user?.id}>\n**ID:** ${user.user?.id}\n**Highest Role:** ${user?.roles.highest}\n**Avatar:** [Link](${user.user?.displayAvatarURL({ size: 512 })})\n**Display Name:** ${nickname}` },
                        { name: "🗓️ Account Joined:", value: `<t:${Math.floor(user?.joinedAt!.getTime()! / 1000)}:D> (<t:${Math.floor(user?.joinedAt!.getTime()! / 1000)}:R>)`, inline: true },
                        { name: "🗓️ Account Created:", value: `<t:${Math.floor((user.user as User).createdAt.getTime() / 1000)}:D> (<t:${Math.floor(user.user.createdAt.getTime()! / 1000)}:R>)`, inline: true },
                    )
                    .setFooter({ text: `Requested by ${message.author?.tag}`, iconURL: message.author?.avatarURL() || undefined })
                message.channel.send({ embeds: [userInfoAuthor] })
            }
        }

    }
}