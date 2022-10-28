import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings"
import Permits from "../../models/permits"

module.exports = {
    data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("Make sure Boolean is running smoothly!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })
        
        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if(!settings) return interaction.reply({  content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })
        
        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if(permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if(hasRole == true) break;
        }

        for (const permit of permits) {
            if(permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if(thePermit?.commandAccess.includes("CHECK") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("CHECK") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })


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
        let joinRoleSet
        let manageChannels
        if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            manageChannels = "<:no:979193272784265217>"
        } else {
            manageChannels = "<:yes:979193272612298814>"
        }
        if (!settings.modSettings?.muteRole) {
            muteRoleSet = "<:no:979193272784265217>"
        } else {
            muteRoleSet = "<:yes:979193272612298814>"
        }
        if (!settings.modSettings?.modLogChannel) {
            modLogChannelSet = "<:recommended:979475658000437258>"
        } else {
            modLogChannelSet = "<:yes:979193272612298814>"
        }
        if (!settings.guildSettings?.joinRole) {
            joinRoleSet = "<:recommended:979475658000437258>"
        } else {
            joinRoleSet = "<:yes:979193272612298814>"
        }

        const checkEmbed = new EmbedBuilder()
            .setAuthor({ name: "Setup Check", iconURL: interaction.user.displayAvatarURL() || undefined })
            .setDescription(`This is a comprehensive list of everything Boolean needs to run smoothly.\n**No Action Needed:** <:yes:979193272612298814>\n**Action Needed:** <:no:979193272784265217>\n**Recommended Setting:** <:recommended:979475658000437258>\n\n**Bot Permissions:** Permissions Boolean needs to run\n> [Manage Roles: ${manageRoles}]\n> [Manage Nicknames: ${manageNicknames}]\n> [Manage Messages: ${manageMessages}]\n> [Manage Channels: ${manageChannels}]\n> [Timeout Users: ${moderateMembers}]\n> [Ban Members: ${banMembers}]\n> [Kick Members: ${kickMembers}]\n> [Administrator: ${admin}]\n\n**Configuration Settings:** Configuration settings\n> [Mute Role: ${muteRoleSet}]\n> [Mod Logs Channel: ${modLogChannelSet}]\n> [Join Role: ${joinRoleSet}]`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setColor(color)
        interaction.reply({ embeds: [checkEmbed] })

    }
}