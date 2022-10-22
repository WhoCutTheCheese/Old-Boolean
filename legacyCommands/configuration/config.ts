import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ['config'],
    commandName: "CONFIG",
    commandCategory: "CONFIGURATION",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if(!settings) return message.channel.send({  content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable; 

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
            .setAuthor({ name: `${message.guild?.name} Configuration Help`, iconURL: message.guild?.iconURL() || client.user?.displayAvatarURL() || undefined })
            .setDescription(`This embed displays all relevent configuration information for your guild.
            
            __**General Information:**__ ${message.guild?.name}
            > **Owner** [<@${message.guild?.ownerId}>]
            > **ID:** [${message.guild?.id}]
            
            __**Configuration Settings**__
            > **Mod Log Channel:** [${modLogsChannel}]
            > **Mute Role:** [${muteRole}]
            > **Join Role:** [${joinRole}]
            > **DM Users When Punished:** [${dmOnPunish}]
            > **Delete Command Usage** [${deleteCommandUsage}]
            *Note: Mod and Admin roles have been removed in favour of permits. \`!!help permit\`*`)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
            .setColor(color)
        message.reply({ embeds: [configEmbed] })

    },
}