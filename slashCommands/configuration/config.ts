import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View all the current config settings!")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
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
        if(thePermit?.commandAccess.includes("CONFIG") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("CONFIG") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        let modLogsChannel
        if (configuration?.modLogChannel === "None") { modLogsChannel = "None" }
        if (configuration?.modLogChannel !== "None") { modLogsChannel = `<#${configuration?.modLogChannel}>` }
        let muteRole
        if (configuration?.muteRoleID === "None") { muteRole = "None" }
        if (configuration?.muteRoleID !== "None") { muteRole = `<@&${configuration?.muteRoleID}>` }
        let joinRole
        if (configuration?.joinRoleID === "None") { joinRole = "None" }
        if (configuration?.joinRoleID !== "None") { joinRole = `<@&${configuration?.joinRoleID}>` }
        const configEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.guild?.name} Configuration Help`, iconURL: interaction.guild?.iconURL() || client.user?.displayAvatarURL() || undefined })
            .setDescription(`This embed displays all relevent configuration information for your guild.
            
            __**General Information:**__ ${interaction.guild?.name}
            > **Owner** [<@${interaction.guild?.ownerId}>]
            > **ID:** [${interaction.guild?.id}]
            
            __**Configuration Settings**__
            > **Mod Log Channel:** [${modLogsChannel}]
            > **Mute Role:** [${muteRole}]
            > **Join Role:** [${joinRole}]
            > **DM Users When Punished:** [${configuration?.dmOnPunish}]
            > **Delete Command Usage** [${configuration?.deleteCommandUsage}]
            *Note: Mod and Admin roles have been removed in favour of permits. Visit the docs [here](https://google.com)!*`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setColor(configuration?.embedColor as ColorResolvable)
        interaction.reply({ embeds: [configEmbed] })

    }
}