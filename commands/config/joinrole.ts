import { Client, Message, MessageEmbed } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['joinrole'],
    expectedArgs: "[@User/User ID] (Reason)",
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
                        joinRoleID: "None"
                    })
                    const areYouSureEmbed = new MessageEmbed()
                        .setTitle("Join Role Deleted")
                        .setDescription("Join role has been successfully reset, and people will no longer recieve a role when joining!")
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [areYouSureEmbed] })
                    break;
                case "view":
                    let adminRole
                    if (configSettings.joinRoleID === "None") { adminRole = "None" }
                    if (configSettings.joinRoleID !== "None") {
                        adminRole = `<@&${configSettings.joinRoleID}>`
                    }
                    const viewAdminRoles = new MessageEmbed()
                        .setAuthor({ name: "Current Join Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`**Join Role:**
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
                        joinRoleID: role.id,
                    })
                    message.channel.send(`You've successfully set **${role.name}** as the Join Role.`)
                    break;
                default:
                    const defaultEmbed = new MessageEmbed()
                        .setColor(guildSettings.color)
                        .setAuthor({ name: "Set Boolean's Join Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`Role given to users when they join.
                        
                        **__Sub Commands:__**
                        > **Reset:** [Delete the join role.]
                        > **View:** [View the current join role]
                        > **Set:** [Set the join role]`)
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    message.channel.send({ embeds: [defaultEmbed] })
            }
        } catch { (err: Error) => {
        ErrorLog(message.guild!, "JOIN_ROLE_COMMAND", err, client, message, `${message.author.id}`, `warn.ts`)
    } }
    },
}