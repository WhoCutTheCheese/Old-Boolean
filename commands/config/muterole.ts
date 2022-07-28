import { ICommand } from "wokcommands";
import { ColorResolvable, GuildChannel, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
export default {
    category: "Configuration",
    description: "Set the mute role.",
    slash: "both",
    minArgs: 1,
    expectedArgs: "[Sub Command] (@Role/Role ID)",
    cooldown: "5s",
    options: [
        {
            name: "subcommand",
            description: "View/Set/Reset",
            required: true,
            type: "STRING"
        }, {
            name: "role",
            description: "Set the mute role.",
            required: false,
            type: "ROLE",
        }
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
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
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [areYouSureEmbed] })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.muteRoleID === "None") { adminRole = "None" }
                        if (configuration.muteRoleID !== "None") {
                            adminRole = `<@&${configuration.muteRoleID}>`
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Mute Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Mute Role:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [viewAdminRoles] })
                        break;
                    case "set":
                        if (!args[1]) {
                            message.channel.send({ content: "You need to supply a role ID or @" });
                            return;
                        }
                        const role = message.guild?.roles.cache.get(args[1]) || message.mentions.roles.first();
                        if (!role) {
                            message.channel.send({ content: "Invalid Role" })
                            return;
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
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Mute Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Role given to users when they mute.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete the mute role.]
                            > **View:** [View the current mute role]
                            > **Set:** [Set the mute role]`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        message.channel.send({ embeds: [defaultEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                switch (args[0]) {
                    case "reset":
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            muteRoleID: "None"
                        })
                        const areYouSureEmbed = new MessageEmbed()
                            .setTitle("Mute Role Deleted")
                            .setDescription("Mute role reset!!")
                            .setColor(configuration.embedColor)
                            interaction.reply({ embeds: [areYouSureEmbed] })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.muteRoleID === "None") { adminRole = "None" }
                        if (configuration.muteRoleID !== "None") {
                            adminRole = `<@&${configuration.muteRoleID}>`
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Mute Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Mute Role:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                        interaction.reply({ embeds: [viewAdminRoles] })
                        break;
                    case "set":
                        if (!args[1]) {
                            interaction.reply({ content: "You need to supply a role ID or @" });
                            return;
                        }
                        const role = interaction.guild?.roles.cache.get(args[1]);
                        if (!role) {
                            interaction.reply({ content: "Invalid Role" })
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            muteRoleID: role.id,
                        })
                        interaction.reply(`You've successfully set **${role.name}** as the Mute Role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Mute Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Role given to users when they mute.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete the mute role.]
                            > **View:** [View the current mute role]
                            > **Set:** [Set the mute role]`)
                            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            interaction.reply({ embeds: [defaultEmbed] })
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