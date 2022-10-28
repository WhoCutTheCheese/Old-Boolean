import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View all the current config settings!")
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
        if(thePermit?.commandAccess.includes("CONFIG") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("CONFIG") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true });

        let modLogsChannel
        if (!settings.modSettings?.modLogChannel) { modLogsChannel = "None" }
        if (settings.modSettings?.modLogChannel) { modLogsChannel = `<#${settings.modSettings.modLogChannel}>` }
        let muteRole
        if (!settings.modSettings?.muteRole) { muteRole = "None" }
        if (settings.modSettings?.muteRole) { muteRole = `<@&${settings.modSettings.muteRole}>` }
        let joinRole
        if (!settings.guildSettings?.joinRole) { joinRole = "None" }
        if (settings.guildSettings?.joinRole) { joinRole = `<@&${settings.guildSettings.joinRole}>` }
        let dmOnPunish
        if(!settings.modSettings?.dmOnPunish) { dmOnPunish = "false" }
        if(settings.modSettings?.dmOnPunish) { dmOnPunish = "true" }
        let deleteCommandUsage
        if(!settings.modSettings?.deleteCommandUsage) { deleteCommandUsage = "false" }
        if(settings.modSettings?.deleteCommandUsage) { deleteCommandUsage = "true" }

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
            > **DM Users When Punished:** [${dmOnPunish}]
            > **Delete Command Usage** [${deleteCommandUsage}]
            *Note: Mod and Admin roles have been removed in favour of permits. \`!!help permit\`*`)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setColor(color)
        interaction.reply({ embeds: [configEmbed] })

    }
}