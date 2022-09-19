import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("View the information of any case.")
        .addNumberOption(caseNum =>
            caseNum.setName("case_number")
                .setRequired(true)
                .setDescription("Enter the case number you'd like to view.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

        let hasPerms
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { hasPerms = false }

        if(!interaction.guild.members.me?.permissions.has([ PermissionsBitField.Flags.SendMessages ])) return interaction.reply({ content: "I cant send messages!", ephemeral: true })

        let caseNumber = interaction.options.getNumber("case_number");
        if(isNaN(Number(caseNumber))) return interaction.reply({ content: "Case number is invalid!", ephemeral: true })

        const foundCase = await Cases.findOne({
            guildID: interaction.guild.id,
            caseNumber: caseNumber
        })

        if(!foundCase) return interaction.reply({ content: `Could not find case \`#${caseNumber}\`!` })

        let userUwU = interaction.guild.members.cache.get(foundCase.userID!)

        const caseInfo = new EmbedBuilder()
            .setAuthor({ name: `Case #${caseNumber}`, iconURL: userUwU?.displayAvatarURL() || undefined })
            .setThumbnail(userUwU?.displayAvatarURL() || null)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setDescription(`Case against <@${foundCase.userID}>
            
            **__Case Details:__**
            > **Moderator:** <@${foundCase.modID!}>
            > **User:** <@${foundCase.userID}> [${foundCase.userID}]
            > **Case Reason:** ${foundCase.caseReason}
            > **Case Type:** ${foundCase.caseType}
            > **Case Length:** ${foundCase.caseLength}
            > **Case Date:** <t:${Math.round(foundCase.caseDate as any / 1000)}:D>`)
            .setTimestamp()
        interaction.reply({ embeds: [caseInfo] })

    }
}