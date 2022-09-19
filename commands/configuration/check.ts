import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Make sure Boolean is running smoothly!")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

        let manageRoles
        let kickMembers
        let banMembers
        let moderateMembers
        let manageNicknames
        let manageMessages
        let admin
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            manageRoles = "<:no:979193272784265217>"
        } else {
            manageRoles = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            kickMembers = "<:no:979193272784265217>"
        } else {
            kickMembers = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            banMembers = "<:no:979193272784265217>"
        } else {
            banMembers = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            moderateMembers = "<:no:979193272784265217>"
        } else {
            moderateMembers = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            manageNicknames = "<:no:979193272784265217>"
        } else {
            manageNicknames = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            manageMessages = "<:no:979193272784265217>"
        } else {
            manageMessages = "<:yes:979193272612298814>"
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            manageChannels = "<:no:979193272784265217>"
        } else {
            manageChannels = "<:yes:979193272612298814>"
        }
        if (configuration?.muteRoleID === "None") {
            muteRoleSet = "<:no:979193272784265217>"
        } else {
            muteRoleSet = "<:yes:979193272612298814>"
        }
        if (configuration?.modLogChannel === "None") {
            modLogChannelSet = "<:recommended:979475658000437258>"
        } else {
            modLogChannelSet = "<:yes:979193272612298814>"
        }
        if (configuration?.modRoleID.length === 0) {
            modRoleSet = "<:recommended:979475658000437258>"
        } else {
            modRoleSet = "<:yes:979193272612298814>"
        }
        if (configuration?.adminRoleID.length === 0) {
            adminRoleSet = "<:recommended:979475658000437258>"
        } else {
            adminRoleSet = "<:yes:979193272612298814>"
        }
        if (configuration?.joinRoleID === "None") {
            joinRoleSet = "<:recommended:979475658000437258>"
        } else {
            joinRoleSet = "<:yes:979193272612298814>"
        }
        const checkEmbed = new EmbedBuilder()
            .setAuthor({ name: "Setup Check", iconURL: interaction.user.displayAvatarURL() || undefined })
            .setDescription(`This is a comprehensive list of everything Boolean needs to run smoothly.\n**No Action Needed:** <:yes:979193272612298814>\n**Action Needed:** <:no:979193272784265217>\n**Recommended Setting:** <:recommended:979475658000437258>\n\n**Bot Permissions:** Permissions Boolean needs to run\n> [Manage Roles: ${manageRoles}]\n> [Manage Nicknames: ${manageNicknames}]\n> [Manage Messages: ${manageMessages}]\n> [Manage Channels: ${manageChannels}]\n> [Timeout Users: ${moderateMembers}]\n> [Ban Members: ${banMembers}]\n> [Kick Members: ${kickMembers}]\n> [Administrator: ${admin}]\n\n**Configuration Settings:** Configuration settings\n> [Mute Role: ${muteRoleSet}]\n> [Mod Logs Channel: ${modLogChannelSet}]\n> [Mod Role: ${modRoleSet}]\n> [Admin Role: ${adminRoleSet}]\n> [Join Role: ${joinRoleSet}]`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setColor(color)
        interaction.reply({ embeds: [checkEmbed] })

    }
}