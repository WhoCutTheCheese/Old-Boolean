import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Remove the ability to talk to all users in a channel.",
    slash: "both",
    aliases: ['unlock', 'uld'],
    minArgs: 1,
    expectedArgs: "(#Channel/Channel ID)",
    permissions: ["MANAGE_MESSAGES"],
    cooldown: "2s",
    options: [
        {
            name: "channel",
            description: 'Channel you want to lock. (Optional)',
            required: false,
            type: 'CHANNEL',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    message.channel.send({ content: "I don't have permission to unlock channels! Run **!!check** to finish setting me up!" })
                    return;
                }
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const channel = message.mentions.channels.first() || message.guild?.channels.cache.find((c: any) => c.id === args[0])
                if (!channel) {
                    if (args[0] !== "all") {
                        (message.channel as TextChannel).permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: null,
                        }).catch((err: Error) => console.error(err))
                        const successEmbed2 = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setDescription(`Channel unlocked!`)
                        message.channel.send({ embeds: [successEmbed2] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Lockdown
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                    } else if (args[0] === "all") {
                        message.guild?.channels.cache.forEach(async (channel: any) => {
                            if (!channel.permissionsFor((message.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                                await channel.permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                                    SEND_MESSAGES: null,
                                }).catch((err: Error) => console.error(err))
                            }
                        });
                        const successEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setDescription(`Unlocked all channels.`)
                        message.channel.send({ embeds: [successEmbed] })

                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Server Unlocked`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                            > [${message.author.id}]
                            > [<@${message.author.id}>]
                            <:pencil:977391492916207636> **Action:** Unlockdown
                            **Channel:** <#${message.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else if (channel) {
                    (channel as TextChannel).permissionOverwrites.edit((channel as TextChannel).guild.id, {
                        SEND_MESSAGES: null,
                    }).catch((err: Error) => { console.error(err) })
                    const successEmbed = new MessageEmbed()
                        .setColor(configuration.embedColor)
                        .setDescription(`You have unlocked <#${channel.id}>.`)
                    message.channel.send({ embeds: [successEmbed] })
                    const successEmbed2 = new MessageEmbed()
                        .setColor(configuration.embedColor)
                        .setDescription(`Channel has been unlocked.`);
                    (message.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Channel Unlocked`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Unlockdown
                        **Channel Executed:** <#${message.channel?.id}>
                        **Channel Locked:** <#${channel.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const modChannel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!modChannel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === modChannel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                }
                return true;
            } else if (interaction) {
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    interaction.reply({ content: "I don't have permission to unlock channels! Run **!!check** to finish setting me up!", ephemeral: true })
                    return;
                }
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === args[0])
                if (!channel) {
                    if (args[0] !== "all") {
                        (interaction.channel as TextChannel).permissionOverwrites.edit((interaction.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: null,
                        }).catch((err: Error) => console.error(err))
                        const successEmbed2 = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setDescription(`Channel unlocked!`)
                            interaction.reply({ embeds: [successEmbed2] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                            > [${interaction.user.id}]
                            > [<@${interaction.user.id}>]
                            <:pencil:977391492916207636> **Action:** Lockdown
                            **Channel:** <#${interaction.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                    } else if (args[0] === "all") {
                        interaction.guild?.channels.cache.forEach(async (channel: any) => {
                            if (!channel.permissionsFor((interaction.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                                await channel.permissionOverwrites.edit((interaction.channel as TextChannel).guild.id, {
                                    SEND_MESSAGES: null,
                                }).catch((err: Error) => console.error(err))
                            }
                        });
                        const successEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setDescription(`Unlocked all channels.`)
                            interaction.reply({ embeds: [successEmbed] })

                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Server Unlocked`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                            .setColor(configuration.embedColor)
                            .setTimestamp()
                            .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                            > [${interaction.user.id}]
                            > [<@${interaction.user.id}>]
                            <:pencil:977391492916207636> **Action:** Unlockdown
                            **Channel:** <#${interaction.channel?.id}>
                            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                        if (!channel) { return; }
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                } else if (channel) {
                    (channel as TextChannel).permissionOverwrites.edit((channel as TextChannel).guild.id, {
                        SEND_MESSAGES: null,
                    }).catch((err: Error) => { console.error(err) })
                    const successEmbed = new MessageEmbed()
                        .setColor(configuration.embedColor)
                        .setDescription(`You have unlocked <#${channel.id}>.`)
                    interaction.reply({ embeds: [successEmbed] })
                    const successEmbed2 = new MessageEmbed()
                        .setColor(configuration.embedColor)
                        .setDescription(`Channel has been unlocked.`);
                    (interaction.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Unlockdown
                        **Channel Executed:** <#${interaction.channel?.id}>
                        **Channel Locked:** <#${channel.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const modChannel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!modChannel) { return; }
                    (interaction.guild?.channels.cache.find((c: any) => c.id === modChannel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand