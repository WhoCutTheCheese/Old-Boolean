import { Client, Message, MessageEmbed } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['muterole'],
    expectedArgs: "[@Role || Role ID]",
    cooldown: 5,
    staffPart: "Admin",
    userPermissions: ["MANAGE_GUILD"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const configSettings = await Config.findOne({
                guildID: message.guild?.id,
            })
            switch (args[0]) {
                case "reset":
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        muteRoleID: "None"
                    })
                    const areYouSureEmbed = new MessageEmbed()
                        .setTitle("Mute Role Deleted")
                        .setDescription("Mute role reset!!")
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [areYouSureEmbed] })
                    break;
                case "view":
                    let adminRole
                    if (configSettings.muteRoleID === "None") { adminRole = "None" }
                    if (configSettings.muteRoleID !== "None") {
                        adminRole = `<@&${configSettings.muteRoleID}>`
                    }
                    const viewAdminRoles = new MessageEmbed()
                        .setAuthor({ name: "Current Mute Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`**Mute Role:**
                        [${adminRole}]`)
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [viewAdminRoles] })
                    break;
                case "set":
                    if(!args[1]) {
                        return message.channel.send({ content: "You need to supply a role ID or @" });
                    }
                    const role = message.guild?.roles.cache.get(args[1]) || message.mentions.roles.first();
                    if(!role) {
                        return message.channel.send({ content: "Invalid Role" })
                    }
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        muteRoleID: role.id,
                    })
                    message.channel.send(`You've successfully set **${role.name}** as the Mute Role.`)
                    break;
                default:
                    const defaultEmbed = new MessageEmbed()
                        .setColor(guildSettings.color)
                        .setAuthor({ name: "Set Boolean's Mute Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`Role given to users when they mute.
                        
                        **__Sub Commands:__**
                        > **Reset:** [Delete the mute role.]
                        > **View:** [View the current mute role]
                        > **Set:** [Set the mute role]`)
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    message.channel.send({ embeds: [defaultEmbed] })
            }
        } catch { (err: Error) => {
        ErrorLog(message.guild!, "MUTE_ROLE_COMMAND", err, client, message, `${message.author.id}`, `mute.ts`)
    } }
    },
}