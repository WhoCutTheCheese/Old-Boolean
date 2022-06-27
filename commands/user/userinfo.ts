import { MessageEmbed, Permissions, Client, Message, GuildMember, User } from 'discord.js'
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['userinfo', 'uinfo', 'user-info', 'whois'],
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: ["<@user/user ID>"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const gSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            let findinserver = message.mentions.members?.first() || message.guild?.members.cache.find((m: any) => m.id === args[0])
            if (!args[0]) {
                const userInfoAuthor = new MessageEmbed()
                    .setAuthor({ name: `${message.author.username}`, iconURL: message.author.avatarURL({ dynamic: true }) || "" })
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                    .setColor(gSettings.color)
                    .addField("Name:", `${message.author.tag}`, true)
                    .addField("Is Bot", `${message.author.bot}`, false)
                    .addField("General Information:", `**Mention:** <@${message.author.id}>\n**ID:** ${message.author.id}\n**Highest Role:** ${message.member!.roles.highest}\n**Avatar:** [Link](${message.author.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${message.author.username}`, false)
                    .addField('🗓️ Account joined:', `<t:${Math.floor(message.member!.joinedAt!.getTime() / 1000)}:D> (<t:${Math.floor(message.member!.joinedAt!.getTime() / 1000)}:R>)`, true)
                    .addField('🗓️ Account Created:', `<t:${Math.floor(message.author.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(message.author.createdAt.getTime() / 1000)}:R>)`, true)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) || "" })
                if (message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                    if (message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                        userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`, `ADMINISTRATOR`")
                    } else {
                        userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`")
                    }
                }
                return message.channel.send({ embeds: [userInfoAuthor] })
            }
            let user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await client.users.fetch(args[0]).catch((err) => message.channel.send({ content: "Unknown user!" }).then(() => console.log(err)))
            if (!user) { return message.channel.send({ content: "Invalid user" }) }
            if (findinserver) {

                let areyouabot = (user as GuildMember).user.bot;
                if ((user as GuildMember).user.id === "585731185083285504") {
                    areyouabot = true
                }
                const userInfoAuthor = new MessageEmbed()
                    .setAuthor({ name: `${(user as GuildMember).user.username}`, iconURL: (user as GuildMember).user.avatarURL({ dynamic: true }) || "" })
                    .setThumbnail((user as GuildMember).user.displayAvatarURL({ dynamic: true }))
                    .setColor(gSettings.color)
                    .addField("Name:", `${(user as GuildMember).user.tag}`, true)
                    .addField("Is Bot", `${areyouabot}`, false)
                    .addField("General Information:", `**Mention:** <@${(user as GuildMember).user.id}>\n**ID:** ${(user as GuildMember).user.id}\n**Highest Role:** ${(user as GuildMember).roles.highest}\n**Avatar:** [Link](${(user as GuildMember).user.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${(user as GuildMember).user.username}`, false)
                    .addField('🗓️ Account joined:', `<t:${Math.floor((user as GuildMember).joinedAt!.getTime() / 1000)}:D> (<t:${Math.floor((user as GuildMember).joinedAt!.getTime() / 1000)}:R>)`, true)
                    .addField('🗓️ Account Created:', `<t:${Math.floor((user as GuildMember).user.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((user as GuildMember).user.createdAt.getTime() / 1000)}:R>)`, true)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) || "" })
                if ((user as GuildMember).permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                    if ((user as GuildMember).permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                        userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`, `ADMINISTRATOR`")
                    } else {
                        userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`")
                    }
                }
                return message.channel.send({ embeds: [userInfoAuthor] })
            } else {
                let areyouabot = (user as User).bot;
                if (args[0] === "585731185083285504") {
                    areyouabot = true
                }
                if (user.id === "585731185083285504") {
                    areyouabot = true
                }
                const userInfoAuthor = new MessageEmbed()
                    .setAuthor({ name: `${(user as User).username}`, iconURL: user.avatarURL({ dynamic: true }) || "" })
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setColor(gSettings.color)
                    .addField("Name:", `${(user as User).tag}`, true)
                    .addField("Is Bot", `${areyouabot}`, false)
                    .addField("General Information:", `**Mention:** <@${user.id}>\n**ID:** ${user.id}\n**Highest Role:** N/A\n**Avatar:** [Link](${user.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${(user as User).username}`, false)
                    .addField('🗓️ Account joined:', `N/A or Not Cached`, true)
                    .addField('🗓️ Account Created:', `<t:${Math.floor((user as User).createdAt.getTime() / 1000)}:D> (<t:${Math.floor((user as User).createdAt.getTime() / 1000)}:R>)`, true)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) || "" })
                message.channel.send({ embeds: [userInfoAuthor] })
            }
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "USERINFO_COMMAND", err, client, message, `${message.author.id}`, `userinfo.ts`)
            }
        }
    },
}