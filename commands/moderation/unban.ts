import { ICommand } from "wokcommands";
import { Message, MessageEmbed, Permissions, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Moderation",
    description: "Unban a member.",
    slash: "both",
    aliases: ['ub'],
    minArgs: 1,
    expectedArgs: "[@User/User ID]",
    permissions: ["BAN_MEMBERS"],
    cooldown: "2s",
    options: [
        {
            name: "user",
            description: 'User to unban.',
            required: true,
            type: 'USER',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: message.guild?.id
                })
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    message.channel.send({ content: "**`[ Error ]`** I don't have permission to unban! Run **!!check** to finish setting me up!" })
                    return true;
                }
                let banUser = await client.users.fetch(args[0]).catch((err) => message.channel.send({ content: "Unknown user!" }).then(() => {
                    console.log(err)
                    return;
                }));
                if (banUser?.id === message.author.id) {
                    message.channel.send({ content: "You're not banned..." })
                    return true;
                }
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: message.guild?.id,
                    userID: banUser?.id,
                    modID: message.author.id,
                    caseType: "Unban",
                    caseReason: "User unbanned.",
                    caseNumber: caseNumberSet,
                    caseLength: "NONE",
                    date: Date.now(),
                })
                newCases.save()

                await Guild.findOneAndUpdate({
                    guildID: message.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                message.guild.members.unban(banUser!.id).then((user: any) => {
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${message.author.tag}`)
                        .setColor(configuration.embedColor)
                    message.channel.send({ content: `<:arrow_right:967329549912248341> **${banUser?.tag}** has been unbanned.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Unbanned - ${banUser?.tag}`, iconURL: banUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser?.tag}
                        > [${banUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${message.author.tag}
                        > [${message.author.id}]
                        > [<@${message.author.id}>]
                        <:pencil:977391492916207636> **Action:** Unban
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${message.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = message.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(message.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (message.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }).catch((err: Error) => {
                    message.channel.send("Member is not banned or doesn't exist!")
                    return;
                })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const guildSettings = await Guild.findOne({
                    guildID: interaction.guild?.id
                })
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    interaction.reply({ content: "**`[ Error ]`** I don't have permission to unban! Run **!!check** to finish setting me up!", ephemeral: true })
                    return true;
                }
                let banUser = await client.users.fetch(args[0]).catch((err) => interaction.reply({ content: "Unknown user!", ephemeral: true }).then(() => {
                    console.log(err)
                    return;
                }));
                if (banUser?.id === interaction.user.id) {
                    interaction.reply({ content: "You're not banned...", ephemeral: true })
                    return true;
                }
                const caseNumberSet = guildSettings.totalCases + 1;
                const newCases = await new Cases({
                    guildID: interaction.guild?.id,
                    userID: banUser?.id,
                    modID: interaction.user.id,
                    caseType: "Unban",
                    caseReason: "User unbanned.",
                    caseNumber: caseNumberSet,
                    caseLength: "NONE",
                    date: Date.now(),
                })
                newCases.save()

                await Guild.findOneAndUpdate({
                    guildID: interaction.guild?.id,
                }, {
                    totalCases: caseNumberSet,
                })
                interaction.guild.members.unban(banUser!.id).then((user: any) => {
                    const unbanEmbed = new MessageEmbed()
                        .setDescription(`**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.tag}`)
                        .setColor(configuration.embedColor)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${banUser?.tag}** has been unbanned.`, embeds: [unbanEmbed] })
                    const modLogEmbed = new MessageEmbed()
                        .setAuthor({ name: `Member Unbanned - ${banUser?.tag}`, iconURL: banUser?.displayAvatarURL({ dynamic: true }) || "" })
                        .setThumbnail(banUser?.displayAvatarURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .setTimestamp()
                        .setDescription(`<:user:977391493218181120> **User:** ${banUser?.tag}
                        > [${banUser?.id}]
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
                        <:pencil:977391492916207636> **Action:** Unban
                        > [**Case:** #${caseNumberSet}]
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                    if (!channel) { return; }
                    if(interaction.guild?.me?.permissionsIn(channel).has(Permissions.FLAGS.SEND_MESSAGES)) { 
                        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
                    }
                }).catch((err: Error) => {
                    interaction.reply({ content: "Member is not banned or doesn't exist!", ephemeral: true })
                    return;
                })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand