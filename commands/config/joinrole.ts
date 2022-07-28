import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Configuration",
    description: "Set the role Boolean will give to users when they join.",
    slash: "both",
    minArgs: 1,
    expectedArgs: "[Sub Command] [@Role/Role ID]",
    cooldown: "5s",
    options: [
        {
            name: "subcommmand",
            description: 'Set/view/Reset',
            required: true,
            type: 'STRING',
            
        }, {
            name: "role",
            description: '@Role/Role ID.',
            required: true,
            type: 'ROLE',
        },
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
                            joinRoleID: "None"
                        })
                        const areYouSureEmbed = new MessageEmbed()
                            .setTitle("Join Role Deleted")
                            .setDescription("Join role has been successfully reset, and people will no longer recieve a role when joining!")
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [areYouSureEmbed] })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.joinRoleID === "None") { adminRole = "None" }
                        if (configuration.joinRoleID !== "None") {
                            adminRole = `<@&${configuration.joinRoleID}>`
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Join Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Join Role:**
                            [${adminRole}]`)
                            .setColor(configuration.color)
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
                            joinRoleID: role.id,
                        })
                        message.channel.send(`You've successfully set **${role.name}** as the Join Role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Join Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Role given to users when they join.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete the join role.]
                            > **View:** [View the current join role]
                            > **Set:** [Set the join role]`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        message.channel.send({ embeds: [defaultEmbed] })
                }
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                switch (args[0]) {
                    case "reset":
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            joinRoleID: "None"
                        })
                        const areYouSureEmbed = new MessageEmbed()
                            .setTitle("Join Role Deleted")
                            .setDescription("Join role has been successfully reset, and people will no longer recieve a role when joining!")
                            .setColor(configuration.embedColor)
                        interaction.reply({ embeds: [areYouSureEmbed] })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.joinRoleID === "None") { adminRole = "None" }
                        if (configuration.joinRoleID !== "None") {
                            adminRole = `<@&${configuration.joinRoleID}>`
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Join Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Join Role:**
                            [${adminRole}]`)
                            .setColor(configuration.color)
                        interaction.reply({ embeds: [viewAdminRoles] })
                        break;
                    case "set":
                        if (!args[1]) {
                            interaction.reply({ content: "You need to supply a role ID or @", ephemeral: true });
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
                            joinRoleID: role.id,
                        })
                        interaction.reply({ content: `You've successfully set **${role.name}** as the Join Role.`, ephemeral: true })
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Join Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Role given to users when they join.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete the join role.]
                            > **View:** [View the current join role]
                            > **Set:** [Set the join role]`)
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