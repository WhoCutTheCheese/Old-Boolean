import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
export default {
    category: "Configuration",
    description: "Check the server config settings.",
    slash: "both",
    aliases: ['settings'],
    maxArgs: 0,
    cooldown: "5s",

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                const prefix = await Prefix.findOne({
                    _id: message.guild?.id,
                })
                let modLogsChannel
                if (configuration.modLogChannel === "None") { modLogsChannel = "None" }
                if (configuration.modLogChannel !== "None") { modLogsChannel = `<#${configuration.modLogChannel}>` }
                let muteRole
                if (configuration.muteRoleID === "None") { muteRole = "None" }
                if (configuration.muteRoleID !== "None") { muteRole = `<@&${configuration.muteRoleID}>` }
                let joinRole
                if (configuration.joinRoleID === "None") { joinRole = "None" }
                if (configuration.joinRoleID !== "None") { joinRole = `<@&${configuration.joinRoleID}>` }
                let modRole
                if (configuration.modRoleID.length === 0) { modRole = "None" }
                if (configuration.modRoleID.length > 0) {
                    modRole = []
                    for (const modRoles of configuration.modRoleID) {
                        modRole.push(` <@&${modRoles}>`)
                    }
                }
                let adminRole
                if (configuration.adminRoleID.length === 0) { adminRole = "None" }
                if (configuration.adminRoleID.length > 0) {
                    adminRole = []
                    for (const adminRoles of configuration.adminRoleID) {
                        adminRole.push(` <@&${adminRoles}>`)
                    }
                }
                const configEmbed = new MessageEmbed()
                    .setAuthor({ name: `${message.guild?.name} Configuration Help`, iconURL: message.guild?.iconURL({ dynamic: true }) || "https://i.imgur.com/m8E4zzv.png" })
                    .setDescription(`This embed displays all relevent configuration information for your guild.
                    Want to edit these settings? Run \`${prefix.prefix}help config\`
                    
                    __**General Information:**__ ${message.guild?.name}
                    > **Owner** [<@${message.guild?.ownerId}>]
                    > **ID:** [${message.guild?.id}]
                    
                    __**Configuration Settings**__
                    > **Mod Log Channel:** [${modLogsChannel}]
                    > **Mute Role:** [${muteRole}]
                    > **Mod Role(s):** [${modRole}]
                    > **Admin Role(s):** [${adminRole}]
                    > **Join Role:** [${joinRole}]
                    > **DM Users When Punished:** [${configuration.dmOnPunish}]`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    .setColor(configuration.embedColor)
                message.channel.send({ embeds: [configEmbed] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const prefix = await Prefix.findOne({
                    _id: interaction.guild?.id,
                })
                let modLogsChannel
                if (configuration.modLogChannel === "None") { modLogsChannel = "None" }
                if (configuration.modLogChannel !== "None") { modLogsChannel = `<#${configuration.modLogChannel}>` }
                let muteRole
                if (configuration.muteRoleID === "None") { muteRole = "None" }
                if (configuration.muteRoleID !== "None") { muteRole = `<@&${configuration.muteRoleID}>` }
                let joinRole
                if (configuration.joinRoleID === "None") { joinRole = "None" }
                if (configuration.joinRoleID !== "None") { joinRole = `<@&${configuration.joinRoleID}>` }
                let modRole
                if (configuration.modRoleID.length === 0) { modRole = "None" }
                if (configuration.modRoleID.length > 0) {
                    modRole = []
                    for (const modRoles of configuration.modRoleID) {
                        modRole.push(` <@&${modRoles}>`)
                    }
                }
                let adminRole
                if (configuration.adminRoleID.length === 0) { adminRole = "None" }
                if (configuration.adminRoleID.length > 0) {
                    adminRole = []
                    for (const adminRoles of configuration.adminRoleID) {
                        adminRole.push(` <@&${adminRoles}>`)
                    }
                }
                const configEmbed = new MessageEmbed()
                    .setAuthor({ name: `${interaction.guild?.name} Configuration Help`, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "https://i.imgur.com/m8E4zzv.png" })
                    .setDescription(`This embed displays all relevent configuration information for your guild.
                    Want to edit these settings? Run \`${prefix.prefix}help config\`
                    
                    __**General Information:**__ ${interaction.guild?.name}
                    > **Owner** [<@${interaction.guild?.ownerId}>]
                    > **ID:** [${interaction.guild?.id}]
                    
                    __**Configuration Settings**__
                    > **Mod Log Channel:** [${modLogsChannel}]
                    > **Mute Role:** [${muteRole}]
                    > **Mod Role(s):** [${modRole}]
                    > **Admin Role(s):** [${adminRole}]
                    > **Join Role:** [${joinRole}]
                    > **DM Users When Punished:** [${configuration.dmOnPunish}]`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    .setColor(configuration.embedColor)
                interaction.reply({ embeds: [configEmbed] })
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand