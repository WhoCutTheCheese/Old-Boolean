import { ICommand } from "wokcommands";
import { ButtonInteraction, ColorResolvable, MessageActionRow, MessageButton, MessageEmbed, Interaction } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Configuration",
    description: "Add a mod role.",
    slash: "both",
    aliases: ['modroleset'],
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
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("CONFIRM")
                        .setStyle("DANGER")
                        .setCustomId(`CONFIRM.${message.author.id}`)
                        .setEmoji("⛔")
                )

                switch (args[0]) {
                    case "reset":
                        message.channel.send("Mod roles reset!")
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            modRoleID: []
                        })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.modRoleID.length === 0) { adminRole = "None" }
                        if (configuration.modRoleID.length > 0) {
                            adminRole = []
                            for (const adminRoles of configuration.modRoleID) {
                                adminRole.push(` <@&${adminRoles}>`)
                            }
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Mod Roles", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Admin Roles:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                        message.channel.send({ embeds: [viewAdminRoles] })
                        break;
                    case "add":
                        if (!args[1]) {
                            message.channel.send({ content: "You need to supply a role ID or @" });
                            return;
                        }
                        const role = message.guild?.roles.cache.get(args[1]) || message.mentions.roles.first();
                        if (!role) {
                            message.channel.send({ content: "Invalid Role" })
                            return;
                        }
                        if (configuration.modRoleID.includes(role.id)) {
                            message.channel.send({ content: "This role is already defined as an Mod." })
                            return;
                        }
                        if (configuration.modRoleID.length === 5) {
                            message.channel.send("You've reached your maxiumum allowed Mod roles.")
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: message.guild?.id,
                        }, {
                            $push: { modRoleID: role.id }
                        })
                        message.channel.send(`You've successfully added **${role.name}** as an Mod role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Mod Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Mod roles get access to the most basic of moderation commands, such as !!warn and !!mute.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete all current Mod roles.]
                            > **View:** [View all current Mod roles]
                            > **Add:** [Add an Mod role (Maximum: 5)]`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        message.channel.send({ embeds: [defaultEmbed] })
                }
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("CONFIRM")
                        .setStyle("DANGER")
                        .setCustomId(`CONFIRM.${interaction.user.id}`)
                        .setEmoji("⛔")
                )

                switch (args[0]) {
                    case "reset":
                        interaction.reply("Mod roles reset!")
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            modRoleID: []
                        })
                        break;
                    case "view":
                        let adminRole
                        if (configuration.modRoleID.length === 0) { adminRole = "None" }
                        if (configuration.modRoleID.length > 0) {
                            adminRole = []
                            for (const adminRoles of configuration.modRoleID) {
                                adminRole.push(` <@&${adminRoles}>`)
                            }
                        }
                        const viewAdminRoles = new MessageEmbed()
                            .setAuthor({ name: "Current Mod Roles", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`**Admin Roles:**
                            [${adminRole}]`)
                            .setColor(configuration.embedColor)
                        interaction.reply({ embeds: [viewAdminRoles] })
                        break;
                    case "add":
                        if (!args[1]) {
                            interaction.reply({ content: "You need to supply a role ID or @" });
                            return;
                        }
                        const role = interaction.guild?.roles.cache.get(args[1]);
                        if (!role) {
                            interaction.reply({ content: "Invalid Role" })
                            return;
                        }
                        if (configuration.modRoleID.includes(role.id)) {
                            interaction.reply({ content: "This role is already defined as an Mod." })
                            return;
                        }
                        if (configuration.modRoleID.length === 5) {
                            interaction.reply("You've reached your maxiumum allowed Mod roles.")
                            return;
                        }
                        await Config.findOneAndUpdate({
                            guildID: interaction.guild?.id,
                        }, {
                            $push: { modRoleID: role.id }
                        })
                        interaction.reply(`You've successfully added **${role.name}** as an Mod role.`)
                        break;
                    default:
                        const defaultEmbed = new MessageEmbed()
                            .setColor(configuration.embedColor)
                            .setAuthor({ name: "Set Boolean's Mod Role", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                            .setDescription(`Mod roles get access to the most basic of moderation commands, such as !!warn and !!mute.
                            
                            **__Sub Commands:__**
                            > **Reset:** [Delete all current Mod roles.]
                            > **View:** [View all current Mod roles]
                            > **Add:** [Add an Mod role (Maximum: 5)]`)
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