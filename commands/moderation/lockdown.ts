import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Moderation",
    description: "Remove the ability to talk to all users in a channel.",
    slash: "both",
    aliases: ['lock', 'ld'],
    permissions: ["MANAGE_MESSAGES"],
    minArgs: 1,
    expectedArgs: "(#Channel/Channel ID)",
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
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to lock channels! Run **!!check** to finish setting me up!" })
                    return;
                }
                const channel = message.mentions.channels.first() || message.guild?.channels.cache.find((c: any) => c.id === args[0])
                if (!channel) {
                    if (args[0] !== "all") {
                        let reason = args.slice(0).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                            return;
                        }
                        ((message.channel as TextChannel).permissionOverwrites).edit((message.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: false
                        })
                        const successEmbed2 = new MessageEmbed()
                            .setTitle("Channel Locked")
                            .setColor(configuration.embedColor)
                            .setDescription(`Channel has been locked.`)
                            .addField("Reason:", reason)
                        message.channel.send({ embeds: [successEmbed2] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Channel Locked Down`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
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
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                            return;
                        }
                        message.guild?.channels.cache.forEach(async (channel: any) => {
                            if (channel.permissionsFor((message.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                                await channel.permissionOverwrites.edit((message.channel as TextChannel).guild.id, {
                                    SEND_MESSAGES: false,
                                });
                            }
                        });
                        const successEmbed = new MessageEmbed()
                            .setTitle("Channels Locked")
                            .setColor(configuration.embedColor)
                            .setDescription(`You have locked down all channels.`)
                            .addField("Reason:", reason)
                        message.channel.send({ embeds: [successEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Server Locked Down`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
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

                    }
                } else if (channel) {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) {
                        message.channel.send({ content: "Reason exceeds maximum size! (250 Characters)" })
                        return;
                    }
                    ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                        SEND_MESSAGES: false
                    });
                    const successEmbed = new MessageEmbed()
                        .setTitle("Channel Locked")
                        .setColor(configuration.embedColor)
                        .setDescription(`You have locked <#${channel.id}>.`)
                        .addField("Reason", reason)
                    message.channel.send({ embeds: [successEmbed] })
                    const successEmbed2 = new MessageEmbed()
                        .setTitle("Channel Locked")
                        .setColor(configuration.embedColor)
                        .setDescription(`Channel has been locked.`)
                        .addField("Reason", reason);
                    (message.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] });

                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Channel Locked Down`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Lockdown
                        **Channel Executed:** <#${message.channel?.id}>
                        **Channel Locked:** <#${channel.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const modChannel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!modChannel) { return; }
                    (message.guild?.channels.cache.find((c: any) => c.id === modChannel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    interaction.reply({ content: "**`[ Error ]`** I don't have permission to lock channels! Run **!!check** to finish setting me up!", ephemeral: true })
                    return true;
                }
                const channel = interaction.guild?.channels.cache.find((c: any) => c.id === args[0])
                if (!channel) {
                    if (args[0] !== "all") {
                        let reason = args.slice(0).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) {
                            interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true })
                            return;
                        }
                        ((interaction.channel as TextChannel).permissionOverwrites).edit((interaction.channel as TextChannel).guild.id, {
                            SEND_MESSAGES: false
                        })
                        const successEmbed2 = new MessageEmbed()
                            .setTitle("Channel Locked")
                            .setColor(configuration.embedColor)
                            .setDescription(`Channel has been locked.`)
                            .addField("Reason:", reason)
                        interaction.reply({ embeds: [successEmbed2] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Channel Locked Down`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
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
                        let reason = args.slice(1).join(" ")
                        if (!reason) { reason = "No reason provided" }
                        if (reason.length > 250) { interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true }) 
                    return;}
                    interaction.guild?.channels.cache.forEach(async (channel: any) => {
                            if (channel.permissionsFor((interaction.channel as TextChannel).guild.roles.everyone).has("SEND_MESSAGES")) {
                                await channel.permissionOverwrites.edit((interaction.channel as TextChannel).guild.id, {
                                    SEND_MESSAGES: false,
                                });
                            }
                        });
                        const successEmbed = new MessageEmbed()
                            .setTitle("Channels Locked")
                            .setColor(configuration.embedColor)
                            .setDescription(`You have locked down all channels.`)
                            .addField("Reason:", reason)
                            interaction.reply({ embeds: [successEmbed] })
                        const modLogEmbed = new MessageEmbed()
                            .setAuthor({ name: `Server Locked Down`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
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

                    }
                } else if (channel) {
                    let reason = args.slice(1).join(" ")
                    if (!reason) { reason = "No reason provided" }
                    if (reason.length > 250) { interaction.reply({ content: "Reason exceeds maximum size! (250 Characters)", ephemeral: true }) 
                return;}
                    ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                        SEND_MESSAGES: false
                    });
                    const successEmbed = new MessageEmbed()
                        .setTitle("Channel Locked")
                        .setColor(configuration.embedColor)
                        .setDescription(`You have locked <#${channel.id}>.`)
                        .addField("Reason", reason)
                        interaction.reply({ embeds: [successEmbed] })
                    const successEmbed2 = new MessageEmbed()
                        .setTitle("Channel Locked")
                        .setColor(configuration.embedColor)
                        .setDescription(`Channel has been locked.`)
                        .addField("Reason", reason);
                    (interaction.guild?.channels.cache.find(c => c.id === channel.id) as TextChannel).send({ embeds: [successEmbed2] });

                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Channel Locked Down`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Lockdown
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