import { Client, Message, MessageEmbed } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['config', 'settings'],
    minArgs: 0,
    maxArgs: 0,
    cooldown: 10,
    allowedStaffRole: "Mod",
    userPermissions: ["ADMINISTRATOR"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const configSchema = await Config.findOne({
                guildID: message.guild?.id
            })
            let verifLevel
            if (message.guild?.verificationLevel == "NONE") { verifLevel = "None" }
            if (message.guild?.verificationLevel == "LOW") { verifLevel = "Low" }
            if (message.guild?.verificationLevel == "MEDIUM") { verifLevel = "Medium" }
            if (message.guild?.verificationLevel == "HIGH") { verifLevel = "(╯°□°）╯︵  ┻━┻" }
            if (message.guild?.verificationLevel == "VERY_HIGH") { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }
            let modLogsChannel
            if (configSchema.modLogChannel === "None") { modLogsChannel = "None" }
            if (configSchema.modLogChannel !== "None") { modLogsChannel = `<#${configSchema.modLogChannel}>` }
            let muteRole
            if (configSchema.muteRoleID === "None") { muteRole = "None" }
            if (configSchema.muteRoleID !== "None") { muteRole = `<@&${configSchema.muteRoleID}>` }
            let joinRole
            if (configSchema.joinRoleID === "None") { joinRole = "None" }
            if (configSchema.joinRoleID !== "None") { joinRole = `<@&${configSchema.joinRoleID}>` }
            let modRole
            if (configSchema.modRoleID.length === 0) { modRole = "None" }
            if (configSchema.modRoleID.length > 0) {
                modRole = []
                for (const modRoles of configSchema.modRoleID) {
                    modRole.push(` <@&${modRoles}>`)
                }
            }
            let adminRole
            if (configSchema.adminRoleID.length === 0) { adminRole = "None" }
            if (configSchema.adminRoleID.length > 0) {
                adminRole = []
                for (const adminRoles of configSchema.adminRoleID) {
                    adminRole.push(` <@&${adminRoles}>`)
                }
            }
            const configEmbed = new MessageEmbed()
                .setAuthor({ name: `${message.guild?.name} Configuration Help`, iconURL: message.guild?.iconURL({ dynamic: true }) || "https://i.imgur.com/m8E4zzv.png" })
                .setDescription(`This embed displays all relevent configuration information for your guild.
                Want to edit these settings? Run \`${guildSettings.prefix}help config\`
                
                __**General Information:**__ ${message.guild?.name}
                > **Owner** [<@${message.guild?.ownerId}>]
                > **ID:** [${message.guild?.id}]
                > **Verification Level:** [${verifLevel}]
                
                __**Configuration Settings**__
                > **Mod Log Channel:** [${modLogsChannel}]
                > **Mute Role:** [${muteRole}]
                > **Mod Role(s):** [${modRole}]
                > **Admin Role(s):** [${adminRole}]
                > **Join Role:** [${joinRole}]`)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                .setColor(guildSettings.color)
            message.channel.send({ embeds: [configEmbed] })
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "CONFIG_COMMAND", err, client, message, `${message.author.id}`, `config.ts`)
            }
        }
    },
}