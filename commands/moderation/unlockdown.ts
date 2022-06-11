import { MessageEmbed, Client, Message, TextChannel, Permissions } from 'discord.js'
import Guild from "../../models/guild";
module.exports = {
    commands: ['unlockdown', 'uld'],
    minArgs: 0,
    cooldown: 5,
    userPermissions: ["MANAGE_MESSAGES"],
    expectedArgs: "(#Channel || all)",
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        if(!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
            return message.channel.send({ content: "I don't have permission to unlockdown! Run **!!check** to finish setting me up!" })
        }
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id
        })
        const channel = message.mentions.channels.first() || message.guild?.channels.cache.find((c: any) => c.id === args[0])
        if (!channel) {
            if (args[0] !== "all") {
                (message.channel as TextChannel).permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                    SEND_MESSAGES: null,
                });
                const successEmbed2 = new MessageEmbed()
                    .setColor(guildSettings.color)
                    .setDescription(`Channel unlocked!`)
                message.channel.send({ embeds: [successEmbed2] })
                ModLog(false, 0, message.guild?.id, "Channel Unlocked", message.author.id, message, client, Date.now())
            } else if (args[0] === "all") {
                message.guild?.channels.cache.forEach(async (channel: any) => {
                    if (!channel.permissionsFor((message.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                        await channel.permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: null,
                        });
                    }
                });
                const successEmbed = new MessageEmbed()
                    .setColor(guildSettings.color)
                    .setDescription(`Unlocked all channels.`)
                message.channel.send({ embeds: [successEmbed] })
                ModLog(false, 0, message.guild?.id, "Guild Unlocked", message.author.id, message, client, Date.now())
            }
        } else if (channel) {
            (channel as TextChannel).permissionOverwrites.edit((channel as TextChannel).guild.id, {
                SEND_MESSAGES: null,
            });
            const successEmbed = new MessageEmbed()
                .setColor(guildSettings.color)
                .setDescription(`You have unlocked <#${channel.id}>.`)
            message.channel.send({ embeds: [successEmbed] })
            const successEmbed2 = new MessageEmbed()
                .setColor(guildSettings.color)
                .setDescription(`Channel has been unlocked.`);
            (message.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] })
            ModLog(false, 0, message.guild?.id, "Channel Unlocked", message.author.id, message, client, Date.now())

            }
    },
}