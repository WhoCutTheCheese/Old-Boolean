import { MessageEmbed, Client } from 'discord.js'
const Guild = require('../../models/guild');
const Config = require("../../models/config");
const ms = require('ms');
module.exports = {
    commands: ['lockdown', 'ld'],
    minArgs: 0,
    cooldown: 5,
    userPermissions: ["MANAGE_MESSAGES"],
    expectedArgs: "(#Channel || all)",
    callback: async (client: Client, bot: any, message: any, args: string[]) => {
        const guildSettings = await Guild.findOne({
            guildID: message.guild.id
        })
        const channel = message.mentions.channels.first() || message.guild.channels.cache.find((c: any) => c.id === args[0])
        if (!channel) {
            if (args[0] !== "all") {
                let reason = args.slice(0).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                message.channel.permissionOverwrites.edit(message.channel.guild.id, {
                    SEND_MESSAGES: false,
                });
                const successEmbed2 = new MessageEmbed()
                    .setTitle("Channel Locked")
                    .setColor(guildSettings.color)
                    .setDescription(`Channel has been locked.`)
                    .addField("Reason", reason)
                message.channel.send({ embeds: [successEmbed2] })
            } else if (args[0] === "all") {
                let reason = args.slice(1).join(" ")
                if (!reason) { reason = "No reason provided" }
                if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
                message.guild.channels.cache.forEach(async (channel: any) => {
                    if (channel.permissionsFor(message.channel.guild.roles.everyone).has("SEND_MESSAGES")) {
                        await channel.permissionOverwrites.edit(message.channel.guild.id, {
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
            }
        } else if (channel) {
            let reason = args.slice(1).join(" ")
            if (!reason) { reason = "No reason provided" }
            if (reason.length > 250) { return message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" }) }
            channel.permissionOverwrites.edit(channel.guild.id, {
                SEND_MESSAGES: false,
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
                .addField("Reason", reason)
            channel.send({ embeds: [successEmbed2] })
        }
    },
}