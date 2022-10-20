import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Cases from "../../models/cases";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delcase")
        .setDescription("Delete any case.")
        .addNumberOption(caseNum =>
            caseNum.setName("case_number")
                .setRequired(true)
                .setDescription("Enter the case number you'd like to delete.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

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
        if(thePermit?.commandAccess.includes("DELCASE") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("DELCASE") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        let caseNumber = interaction.options.getNumber("case_number");
        if (isNaN(Number(caseNumber))) return interaction.reply({ content: "Case number is invalid!", ephemeral: true })

        const foundCase = await Cases.findOne({
            guildID: interaction.guild.id,
            caseNumber: caseNumber
        })

        if (!foundCase) return interaction.reply({ content: `Could not find case \`#${caseNumber}\`!`, ephemeral: true })

        await Cases.findOneAndDelete({
            caseNumber: caseNumber,
            guildID: interaction.guild.id
        })

        const caseDeleted = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> Deleted case \`#${caseNumber}\``)
            .setColor(configuration?.embedColor as ColorResolvable)
        interaction.reply({ embeds: [caseDeleted] })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Case Deleted`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setThumbnail(interaction.user.displayAvatarURL() || null)
            .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Case Delete
            > [**Case Number:** #${caseNumber}]

            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!channel) { return; }
        if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
        }

    }
}