import { MessageEmbed, Permissions, Client, Message } from 'discord.js'
const Guild = require('../../models/guild');
module.exports = {
    commands: ['userinfo', 'uinfo', 'user-info', 'whois'],
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: ["<@user/user ID>"],
    callback: async (client: Client, bot: string, message: any, args: string[]) => {
        const gSettings = await Guild.findOne({
            guildID: message.guild.id
        })
        let findinserver = message.mentions.members.first() || message.guild.members.cache.find((m: any) => m.id === args[0])
        if (!args[0]) {
            const userInfoAuthor = new MessageEmbed()
                .setAuthor({ name: `${message.author.username}`, iconURL: message.author.avatarURL({ dynamic: true }) })
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setColor(gSettings.color)
                .addField("Name:", `${message.author.tag}`, true)
                .addField("Is Bot", `${message.author.bot}`, false)
                .addField("General Information:", `**Mention:** <@${message.author.id}>\n**ID:** ${message.author.id}\n**Highest Role:** ${message.member.roles.highest}\n**Avatar:** [Link](${message.author.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${message.author.username}`, false)
                .addField('🗓️ Account joined:', `<t:${Math.floor(message.member.joinedAt.getTime() / 1000)}:D> (<t:${Math.floor(message.member.joinedAt.getTime() / 1000)}:R>)`, true)
                .addField('🗓️ Account Created:', `<t:${Math.floor(message.author.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(message.author.createdAt.getTime() / 1000)}:R>)`, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) })
            if (message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`, `ADMINISTRATOR`")
                } else {
                    userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`")
                }
            }
            return message.channel.send({ embeds: [userInfoAuthor] })
        }
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await client.users.fetch(args[0]).catch((err: any) => message.channel.send({ content: "Unknown user!" }).then(console.log(err)))
        if(!user) { return message.channel.send({ content: "Invalid user" }) }
        if (findinserver) {

            let areyouabot = user.user.bot;
            if(user.user.id === "585731185083285504") {
                areyouabot = "true"
            }
            const userInfoAuthor = new MessageEmbed()
                .setAuthor({ name: `${user.user.username}`, iconURL: user.user.avatarURL({ dynamic: true }) })
                .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
                .setColor(gSettings.color)
                .addField("Name:", `${user.user.tag}`, true)
                .addField("Is Bot", `${areyouabot}`, false)
                .addField("General Information:", `**Mention:** <@${user.user.id}>\n**ID:** ${user.user.id}\n**Highest Role:** ${user.roles.highest}\n**Avatar:** [Link](${user.user.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${user.user.username}`, false)
                .addField('🗓️ Account joined:', `<t:${Math.floor(user.joinedAt.getTime() / 1000)}:D> (<t:${Math.floor(user.joinedAt.getTime() / 1000)}:R>)`, true)
                .addField('🗓️ Account Created:', `<t:${Math.floor(user.user.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(user.user.createdAt.getTime() / 1000)}:R>)`, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) })
            if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`, `ADMINISTRATOR`")
                } else {
                    userInfoAuthor.addField("Dangerous Permissions:", "`MANAGE_GUILD`")
                }
            }
            return message.channel.send({ embeds: [userInfoAuthor] })
        } else {
            let areyouabot = user.bot;
            if(args[0] === "585731185083285504") {
                areyouabot = "true"
            }
            if(user.id === "585731185083285504") {
                areyouabot = "true"
            }
            const userInfoAuthor = new MessageEmbed()
                .setAuthor({ name: `${user.username}`, iconURL: user.avatarURL({ dynamic: true }) })
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor(gSettings.color)
                .addField("Name:", `${user.tag}`, true)
                .addField("Is Bot", `${areyouabot}`, false)
                .addField("General Information:", `**Mention:** <@${user.id}>\n**ID:** ${user.id}\n**Highest Role:** N/A\n**Avatar:** [Link](${user.displayAvatarURL({ size: 512, dynamic: true })})\n**Display Name:** ${user.username}`, false)
                .addField('🗓️ Account joined:', `N/A or Not Cached`, true)
                .addField('🗓️ Account Created:', `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>)`, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({ dynamic: true }) })
                message.channel.send({ embeds: [userInfoAuthor] })
            }
            
        }
    }