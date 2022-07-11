import { Client, GuildChannel, Message, MessageEmbed, Permissions } from "discord.js";
import Guild from "../../models/guild";
import Config from "../../models/config";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['modlog', 'ml'],
    minArgs: 1,
    expectedArgs: "",
    staffPart: "Admin",
    cooldown: 10,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id
            })
            const configSchema = await Config.findOne({
                guildID: message.guild?.id
            })
            switch(args[0]) {
                case "view":
                    let modLogsChannel
                    if (configSchema.modLogChannel === "None") { modLogsChannel = "None" }
                    if (configSchema.modLogChannel !== "None") { modLogsChannel = `<#${configSchema.modLogChannel}>` }
                    const viewEmbed = new MessageEmbed()
                        .setAuthor({ name: "Current Mod Log Channel", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription(`**__Current Mod Log Channel:__**
                        [${modLogsChannel}]`)
                    message.channel.send({ embeds: [viewEmbed] })
                    break;
                case "set":
                    const channel = message.mentions.channels.first() || message.guild?.channels.fetch(args[1])
                    if(!channel) { return message.channel.send({ content: "Invalid channel." }) }
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id
                    }, {
                        modLogChannel: (channel as GuildChannel).id
                    })
                    const successEmbed = new MessageEmbed()
                        .setDescription(`<:arrow_right:967329549912248341> **Mod Logging channel set to <#${(channel as GuildChannel).id}>**`)
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [successEmbed] })
                    break;
                default:
                    const defaultEmbed = new MessageEmbed()
                        .setAuthor({ name: "Mod Logs", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setColor(guildSettings.color)
                        .setDescription(`View, set and delete the Mod Logging channel.
                        
                        **__Sub Commands__**
                        > **View:** [View the current mod log channel.]
                        > **Set:** [Set the mod logging channel.]
                        > **Remove:** [Delete the mod logging channel.]`)
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    message.channel.send({ embeds: [defaultEmbed] })
            }
        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "MOD_LOG_SET_COMMAND", err, client, message, `${message.author.id}`, `modlogset.ts`)
            }
        }
    },
}