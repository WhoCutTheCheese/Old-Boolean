import { ICommand } from "wokcommands";
import { ButtonInteraction, ColorResolvable, MessageActionRow, MessageButton, MessageEmbed, Interaction } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Configuration",
    description: "Add a mod role.",
    slash: "both",
    aliases: ['adminroleset'],
    minArgs: 1,
    expectedArgs: "[Sub Command] [@Role/Role ID]",
    cooldown: "5s",
    options: [
        {
            name: "subcommand",
            description: 'Add/View/Reset.',
            required: true,
            type: 'STRING',
        }, {
            name: "role",
            description: "Add the mod role.",
            required: false,
            type: "ROLE",
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
                        message.channel.send("Admin roles reset!")
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            adminRoleID: []
                        })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.adminRoleID.length === 0) { adminRole = "None" }
                        if (configuration.adminRoleID.length > 0) {
                            adminRole = []
                            for (const adminRoles of configuration.adminRoleID) {
                                adminRole.push(` <@&${adminRoles}>`)
                            }
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Admin Roles", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Admin Roles:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [viewAdminRoles] })
                        break;
                    case "add":
                        if (!args[1]) {
                            return message.channel.send({ content: "You need to supply a role ID or @" });
                        }
                        const role = message.guild?.roles.cache.get(args[1]) || message.mentions.roles.first();
                        if (!role) {
                            return message.channel.send({ content: "Invalid Role" })
                        }
                        if (configuration.adminRoleID.includes(role.id)) {
                            return message.channel.send({ content: "This role is already defined as an Admin." })
                        }
                        if (configuration.adminRoleID.length === 5) {
                            return message.channel.send("You've reached your maxiumum allowed Admin roles.")
                        }
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            $push: { adminRoleID: role.id }
                        })
                        message.channel.send(`You've successfully added **${role.name}** as an Admin role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Admin Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Admin is the most powerful role in Boolean. Admins get access to every command except **DAC**. Don't give this role out to anyone!
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete all current Admin roles.]
                            > **View:** [View all current Admin roles]
                            > **Add:** [Add an Admin role (Maximum: 5)]`)
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
                        interaction.reply("Admin roles reset!")
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            adminRoleID: []
                        })
                    break;
                    case "view":
                        let adminRole
                        if (configuration.adminRoleID.length === 0) { adminRole = "None" }
                        if (configuration.adminRoleID.length > 0) {
                            adminRole = []
                            for (const adminRoles of configuration.adminRoleID) {
                                adminRole.push(` <@&${adminRoles}>`)
                            }
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Admin Roles", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Admin Roles:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                            interaction.reply({ embeds: [viewAdminRoles] })
                        break;
                    case "add":
                        if (!args[1]) {
                            interaction.reply({ content: "You need to supply a role ID or @", ephemeral: true });
                            return;
                        }
                        const role = interaction.guild?.roles.cache.get(args[1]);
                        if (!role) {
                            interaction.reply({ content: "Invalid Role", ephemeral: true })
                            return;
                        }
                        if (configuration.adminRoleID.includes(role.id)) {
                            interaction.reply({ content: "This role is already defined as an Admin.", ephemeral: true })
                            return;
                        }
                        if (configuration.adminRoleID.length === 5) {
                            interaction.reply({ content: "You've reached your maxiumum allowed Admin roles.", ephemeral: true  })
                        }
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            $push: { adminRoleID: role.id }
                        })
                        interaction.reply(`You've successfully added **${role.name}** as an Admin role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Admin Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Admin is the most powerful role in Boolean. Admins get access to every command except **DAC**. Don't give this role out to anyone!
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete all current Admin roles.]
                            > **View:** [View all current Admin roles]
                            > **Add:** [Add an Admin role (Maximum: 5)]`)
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