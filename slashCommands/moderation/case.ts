import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, PermissionFlagsBits, User } from "discord.js";
import Configuration from "../../models/config"
import Cases from "../../models/cases";
import Permits from "../../models/permits";

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
        if(thePermit?.commandAccess.includes("CASE") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("CASE") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        let caseNumber = interaction.options.getNumber("case_number");
        if(isNaN(Number(caseNumber))) return interaction.reply({ content: "Case number is invalid!", ephemeral: true })

        const foundCase = await Cases.findOne({
            guildID: interaction.guild.id,
            caseNumber: caseNumber
        })

        if(!foundCase) return interaction.reply({ content: `Could not find case \`#${caseNumber}\`!` })

        let userUwU = await client.users.fetch(foundCase.userID!).catch((err: Error) => console.log(err))
        let username : string
        if(!userUwU) userUwU = client.user as User; username = `<@${foundCase.userID}>`
        username = userUwU.tag

        const caseInfo = new EmbedBuilder()
            .setAuthor({ name: `Case #${caseNumber}`, iconURL: userUwU?.displayAvatarURL() || undefined })
            .setThumbnail(userUwU?.displayAvatarURL() || null)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setDescription(`Case against <@${foundCase.userID}>
            
            **__Case Details:__**
            > **Moderator:** <@${foundCase.modID!}>
            > **User:** ${username} (${foundCase.userID})
            > **Case Reason:** ${foundCase.caseReason}
            > **Case Type:** ${foundCase.caseType}
            > **Case Length:** ${foundCase.caseLength}
            > **Case Date:** <t:${Math.round(foundCase.caseDate as any / 1000)}:D>`)
            .setTimestamp()
        interaction.reply({ embeds: [caseInfo] })

    }
}