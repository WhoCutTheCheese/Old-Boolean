import { MessageEmbed, Client, Message, TextChannel, Permissions } from 'discord.js'
const Guild = require('../../models/guild');
const Config = require("../../models/config");
const ms = require('ms');
const ModLog = require('../../functions/modlogs')
module.exports = {
    commands: ['lockdown', 'ld'],
    minArgs: 0,
    cooldown: 5,
    userPermissions: ["MANAGE_MESSAGES"],
    expectedArgs: "(#Channel || all)",
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
            return message.channel.send({ content: "I don't have permission to lockdown! Run **!!check** to finish setting me up!" })
        }
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id
        })
        const channel = message.mentions.channels.first() || message.guild?.channels.cache.find((c: any) => c.id === args[0])
        if (!channel) {
            if (args[0] !== "all") {
                let reason = args.slice(0).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                ((message.channel as TextChannel).permissionOverwrites).edit((message.channel as TextChannel).guild.id, {
                    SEND_MESSAGES: false
                })
                const successEmbed2 = new MessageEmbed()
                    .setTitle("Channel Locked")
                    .setColor(guildSettings.color)
                    .setDescription(`Channel has been locked.`)
                    .addField("Reason", reason)
                message.channel.send({ embeds: [successEmbed2] })
                ModLog(false, 0, message.guild?.id, "Channel Lockdown", message.author.id, message, client, Date.now())
            } else if (args[0] === "all") {
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                message.guild?.channels.cache.forEach(async (channel: any) => {
                    if (channel.permissionsFor((message.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                        await channel.permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: false,
                        });
                    }
                });
                const successEmbed = new MessageEmbed()
                    .setTitle("Channel Locked")
                    .setColor(guildSettings.color)
                    .setDescription(`You have locked down all channels.`)
                    .addField("Reason", reason)
                message.channel.send({ embeds: [successEmbed] })
                ModLog(false, 0, message.guild?.id, "Guild Lockdown", message.author.id, message, client, Date.now())

            }
        } else if (channel) {
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SEND_MESSAGES: false
            });
            const successEmbed = new MessageEmbed()
                .setTitle("Channel Locked")
                .setColor(guildSettings.color)
                .setDescription(`You have locked <#${channel.id}>.`)
                .addField("Reason", reason)
            message.channel.send({ embeds: [successEmbed] })
            const successEmbed2 = new MessageEmbed()
                .setTitle("Channel Locked")
                .setColor(guildSettings.color)
                .setDescription(`Channel has been locked.`)
                .addField("Reason", reason);
            (message.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] })
            ModLog(false, 0, message.guild?.id, "Channel Lockdown", message.author.id, message, client, Date.now())

        }
    },
}