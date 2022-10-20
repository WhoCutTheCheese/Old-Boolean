import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import Configuration from "../../models/config";

module.exports = {
    commands: ['config'],
    commandName: "CONFIG",
    commandCategory: "CONFIGURATION",
    cooldown: 3,
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
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
            > **DM Users When Punished:** [${configuration?.dmOnPunish}]
            > **Delete Command Usage** [${configuration?.deleteCommandUsage}]
            *Note: Mod and Admin roles have been removed in favour of permits. \`!!help permit\`*`)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
            .setColor(configuration?.embedColor as ColorResolvable)
        message.reply({ embeds: [configEmbed] })

    },
}