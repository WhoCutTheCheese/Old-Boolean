import { MessageEmbed, Client } from 'discord.js'
const Guild = require('../../models/guild');
const Config = require("../../models/config");
module.exports = {
    commands: ['unlockdown', 'uld'],
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
                message.channel.permissionOverwrites.edit(message.channel.guild.id, {
                    SEND_MESSAGES: null,
                });
                const successEmbed2 = new MessageEmbed()
                    .setColor(guildSettings.color)
                    .setDescription(`Channel unlocked!`)
                message.channel.send({ embeds: [successEmbed2] })
            } else if (args[0] === "all") {
                message.guild.channels.cache.forEach(async (channel: any) => {
                    if (!channel.permissionsFor(message.channel.guild.roles.everyone).has("SEND_MESSAGES")) {
                        await channel.permissionOverwrites.edit(message.channel.guild.id, {
                            SEND_MESSAGES: null,
                        });
                    }
                });
                const successEmbed = new MessageEmbed()
                    .setColor(guildSettings.color)
                    .setDescription(`Unlocked all channels.`)
                message.channel.send({ embeds: [successEmbed] })
            }
        } else if (channel) {
            channel.permissionOverwrites.edit(channel.guild.id, {
                SEND_MESSAGES: null,
            });
            const successEmbed = new MessageEmbed()
                .setColor(guildSettings.color)
                .setDescription(`You have unlocked <#${channel.id}>.`)
            message.channel.send({ embeds: [successEmbed] })
            const successEmbed2 = new MessageEmbed()
                .setColor(guildSettings.color)
                .setDescription(`Channel has been unlocked.`)
            channel.send({ embeds: [successEmbed2] })
        }
    },
}