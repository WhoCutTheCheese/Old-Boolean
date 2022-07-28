import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
export default {
    category: "Configuration",
    description: "Make sure Boolean is correctly setup.",
    slash: "both",
    maxArgs: 0,
    cooldown: "5s",

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                let manageRoles
                let kickMembers
                let banMembers
                let moderateMembers
                let manageNicknames
                let manageMessages
                let admin
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    manageRoles = "<:no:979193272784265217>"
                } else {
                    manageRoles = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                    kickMembers = "<:no:979193272784265217>"
                } else {
                    kickMembers = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    banMembers = "<:no:979193272784265217>"
                } else {
                    banMembers = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    moderateMembers = "<:no:979193272784265217>"
                } else {
                    moderateMembers = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
                    manageNicknames = "<:no:979193272784265217>"
                } else {
                    manageNicknames = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    manageMessages = "<:no:979193272784265217>"
                } else {
                    manageMessages = "<:yes:979193272612298814>"
                }
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    admin = "<:recommended:979475658000437258>"
                } else {
                    admin = "<:yes:979193272612298814>"
                }
                let muteRoleSet
                let modLogChannelSet
                let modRoleSet
                let adminRoleSet
                let joinRoleSet
                let manageChannels
                if (!message.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    manageChannels = "<:no:979193272784265217>"
                } else {
                    manageChannels = "<:yes:979193272612298814>"
                }
                if (configuration.muteRoleID === "None") {
                    muteRoleSet = "<:no:979193272784265217>"
                } else {
                    muteRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.modLogChannel === "None") {
                    modLogChannelSet = "<:recommended:979475658000437258>"
                } else {
                    modLogChannelSet = "<:yes:979193272612298814>"
                }
                if (configuration.modRoleID.length === 0) {
                    modRoleSet = "<:recommended:979475658000437258>"
                } else {
                    modRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.adminRoleID.length === 0) {
                    adminRoleSet = "<:recommended:979475658000437258>"
                } else {
                    adminRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.joinRoleID === "None") {
                    joinRoleSet = "<:recommended:979475658000437258>"
                } else {
                    joinRoleSet = "<:yes:979193272612298814>"
                }
                const checkEmbed = new MessageEmbed()
                    .setAuthor({ name: "Setup Check", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    .setDescription(`This is a comprehensive list of everything Boolean needs to run smoothly.\n**No Action Needed:** <:yes:979193272612298814>\n**Action Needed:** <:no:979193272784265217>\n**Recommended Setting:** <:recommended:979475658000437258>\n\n**Bot Permissions:** Permissions Boolean needs to run\n> [Manage Roles: ${manageRoles}]\n> [Manage Nicknames: ${manageNicknames}]\n> [Manage Messages: ${manageMessages}]\n> [Manage Channels: ${manageChannels}]\n> [Timeout Users: ${moderateMembers}]\n> [Ban Members: ${banMembers}]\n> [Kick Members: ${kickMembers}]\n> [Administrator: ${admin}]\n\n**Configuration Settings:** Configuration settings\n> [Mute Role: ${muteRoleSet}]\n> [Mod Logs Channel: ${modLogChannelSet}]\n> [Mod Role: ${modRoleSet}]\n> [Admin Role: ${adminRoleSet}]\n> [Join Role: ${joinRoleSet}]`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor(configuration.embedcolor)
                message.channel.send({ embeds: [checkEmbed] })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                let manageRoles
                let kickMembers
                let banMembers
                let moderateMembers
                let manageNicknames
                let manageMessages
                let admin
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    manageRoles = "<:no:979193272784265217>"
                } else {
                    manageRoles = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
                    kickMembers = "<:no:979193272784265217>"
                } else {
                    kickMembers = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                    banMembers = "<:no:979193272784265217>"
                } else {
                    banMembers = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
                    moderateMembers = "<:no:979193272784265217>"
                } else {
                    moderateMembers = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
                    manageNicknames = "<:no:979193272784265217>"
                } else {
                    manageNicknames = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                    manageMessages = "<:no:979193272784265217>"
                } else {
                    manageMessages = "<:yes:979193272612298814>"
                }
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    admin = "<:recommended:979475658000437258>"
                } else {
                    admin = "<:yes:979193272612298814>"
                }
                let muteRoleSet
                let modLogChannelSet
                let modRoleSet
                let adminRoleSet
                let joinRoleSet
                let manageChannels
                if (!interaction.guild?.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                    manageChannels = "<:no:979193272784265217>"
                } else {
                    manageChannels = "<:yes:979193272612298814>"
                }
                if (configuration.muteRoleID === "None") {
                    muteRoleSet = "<:no:979193272784265217>"
                } else {
                    muteRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.modLogChannel === "None") {
                    modLogChannelSet = "<:recommended:979475658000437258>"
                } else {
                    modLogChannelSet = "<:yes:979193272612298814>"
                }
                if (configuration.modRoleID.length === 0) {
                    modRoleSet = "<:recommended:979475658000437258>"
                } else {
                    modRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.adminRoleID.length === 0) {
                    adminRoleSet = "<:recommended:979475658000437258>"
                } else {
                    adminRoleSet = "<:yes:979193272612298814>"
                }
                if (configuration.joinRoleID === "None") {
                    joinRoleSet = "<:recommended:979475658000437258>"
                } else {
                    joinRoleSet = "<:yes:979193272612298814>"
                }
                const checkEmbed = new MessageEmbed()
                    .setAuthor({ name: "Setup Check", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || "" })
                    .setDescription(`This is a comprehensive list of everything Boolean needs to run smoothly.\n**No Action Needed:** <:yes:979193272612298814>\n**Action Needed:** <:no:979193272784265217>\n**Recommended Setting:** <:recommended:979475658000437258>\n\n**Bot Permissions:** Permissions Boolean needs to run\n> [Manage Roles: ${manageRoles}]\n> [Manage Nicknames: ${manageNicknames}]\n> [Manage Messages: ${manageMessages}]\n> [Manage Channels: ${manageChannels}]\n> [Timeout Users: ${moderateMembers}]\n> [Ban Members: ${banMembers}]\n> [Kick Members: ${kickMembers}]\n> [Administrator: ${admin}]\n\n**Configuration Settings:** Configuration settings\n> [Mute Role: ${muteRoleSet}]\n> [Mod Logs Channel: ${modLogChannelSet}]\n> [Mod Role: ${modRoleSet}]\n> [Admin Role: ${adminRoleSet}]\n> [Join Role: ${joinRoleSet}]`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(configuration.embedcolor)
                    interaction.reply({ embeds: [checkEmbed] })

            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand