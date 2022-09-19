import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View all the current config settings!")
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

        let modLogsChannel
        if (configuration?.modLogChannel === "None") { modLogsChannel = "None" }
        if (configuration?.modLogChannel !== "None") { modLogsChannel = `<#${configuration?.modLogChannel}>` }
        let muteRole
        if (configuration?.muteRoleID === "None") { muteRole = "None" }
        if (configuration?.muteRoleID !== "None") { muteRole = `<@&${configuration?.muteRoleID}>` }
        let joinRole
        if (configuration?.joinRoleID === "None") { joinRole = "None" }
        if (configuration?.joinRoleID !== "None") { joinRole = `<@&${configuration?.joinRoleID}>` }
        let modRole
        if (configuration?.modRoleID.length === 0) { modRole = "None" }
        if (configuration?.modRoleID.length! > 0) {
            modRole = []
            for (const modRoles of configuration?.modRoleID!) {
                modRole.push(` <@&${modRoles}>`)
            }
        }
        let adminRole
        if (configuration?.adminRoleID.length === 0) { adminRole = "None" }
        if (configuration?.adminRoleID.length! > 0) {
            adminRole = []
            for (const adminRoles of configuration?.adminRoleID!) {
                adminRole.push(` <@&${adminRoles}>`)
            }
        }
        const configEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.guild?.name} Configuration Help`, iconURL: interaction.guild?.iconURL() || "https://i.imgur.com/m8E4zzv.png" })
            .setDescription(`This embed displays all relevent configuration information for your guild.
            
            __**General Information:**__ ${interaction.guild?.name}
            > **Owner** [<@${interaction.guild?.ownerId}>]
            > **ID:** [${interaction.guild?.id}]
            
            __**Configuration Settings**__
            > **Mod Log Channel:** [${modLogsChannel}]
            > **Mute Role:** [${muteRole}]
            > **Mod Role(s):** [${modRole}]
            > **Admin Role(s):** [${adminRole}]
            > **Join Role:** [${joinRole}]
            > **DM Users When Punished:** [${configuration?.dmOnPunish}]`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setColor(color)
        interaction.reply({ embeds: [configEmbed] })

    }
}