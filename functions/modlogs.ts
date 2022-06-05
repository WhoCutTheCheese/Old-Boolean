import { Client, Message, MessageEmbed, TextChannel, User, Permissions } from 'discord.js'
const Guild = require("../models/guild")
const ConfigSchema = require("../models/config")
const Cases = require("../models/cases")
declare global {
    var ModLog: any;
}
globalThis.ModLog = async function (punishment: boolean, caseID: number, serverID: string, action: string, actionUser: string, message: Message, client: Client, date: number) {
    const caseFind = await Cases.findOne({
        guildID: serverID,
        caseNumber: caseID,
    })
    const serverSettings = await Guild.findOne({
        guildID: serverID,
    })
    const configFind = await ConfigSchema.findOne({
        guildID: serverID,
    })
    if(!configFind) { return; }
    let permLevel = "Unknown"
    if (message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        permLevel = "Administrator"
    } else if (message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
        permLevel = "Administrator"
    } else if (message.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
        permLevel = "Moderator"
    } else if (message.member?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
        permLevel = "Moderator"
    }
    if (configFind.modLogChannel === "None") { return; }
    if (punishment === true) {
        if (!caseFind) { return; }
        const findUser = await client.users.fetch(caseFind.userID).catch((err) => console.log(err))
        const modLogEmbed = new MessageEmbed()
            .setAuthor({ name: `Punishment Issued - ${(findUser as User).tag}`, iconURL: (findUser as User).displayAvatarURL({ dynamic: true }) || "" })
            .setThumbnail((findUser as User).displayAvatarURL({ dynamic: true }) || "")
            .setColor(serverSettings.color)
            .setTimestamp()
        if (caseFind.caseType !== "Mute") {
            modLogEmbed.setDescription(`<:user:977391493218181120> **User:** ${(findUser as User).tag}\n> [${caseFind.userID}]\n> [<@${caseFind.userID}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n> Permission Level: [${permLevel}]\n<:pencil:977391492916207636> **Action:** ${caseFind.caseType}\n> [Case #${caseFind.caseNumber}]\n**Reason:** ${caseFind.caseReason}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(caseFind.date / 1000)}:D>`)

        } else if (caseFind.caseType === "Mute") {
            modLogEmbed.setDescription(`<:user:977391493218181120> **User:** ${(findUser as User).tag}\n> [${caseFind.userID}]\n> [<@${caseFind.userID}>]\n<:folder:977391492790362173> **Mod:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n> Permission Level: [${permLevel}]\n<:pencil:977391492916207636> **Action:** ${caseFind.caseType}\n> [Case #${caseFind.caseNumber}]\n**Reason:** ${caseFind.caseReason}\n**Duration:** ${caseFind.caseLength}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(caseFind.date / 1000)}:D>`)
        }
        const channel = message.guild?.channels.cache.find((c: any) => c.id === configFind.modLogChannel);
        (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
    } else if (punishment === false) {
        const findUser = await client.users.fetch(actionUser).catch((err) => console.log(err))
        const modLogEmbed = new MessageEmbed()
            .setAuthor({ name: `Command Used - ${(findUser as User).tag}`, iconURL: (findUser as User).displayAvatarURL({ dynamic: true }) || "" })
            .setThumbnail((findUser as User).displayAvatarURL({ dynamic: true }) || "")
            .setDescription(`<:user:977391493218181120> **User:** ${message.author.tag}\n> [${message.author.id}]\n> [<@${message.author.id}>]\n> Permission Level: [${permLevel}]\n**Action:** ${action}\n**Channel:** <#${message.channel.id}>\n**Date:** <t:${Math.round(date / 1000)}:D>`)
            .setColor(serverSettings.color)
            .setTimestamp()
        const channel = message.guild?.channels.cache.find((c: any) => c.id === configFind.modLogChannel);
        (message.guild?.channels.cache.find(c => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })

    }

}