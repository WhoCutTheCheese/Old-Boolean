import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Permits from "../../models/permits"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("automute")
        .setDescription("Change automute settings!")
        .addStringOption(choice =>
            choice.setName("sub_command")
                .setRequired(true)
                .setDescription("Chose what action you would like to take.")
                .addChoices(
                    { name: "Warns Before Mute", value: "warnsmute" },
                )
        )
        .addNumberOption(role =>
            role.setName("warns")
                .setDescription("Input for the \"Warns Before Mute\" option.")
                .setRequired(false)
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
        if(thePermit?.commandAccess.includes("AUTOMUTE") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("AUTOMUTE") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subCommand = interaction.options.getString("sub_command")

        const warns = interaction.options.getNumber("warns")

        switch (subCommand) {
            case "warnsmute":

                if(isNaN(Number(warns))) return interaction.reply({ content: "Invalid warn amount!", ephemeral: true })
                if(warns! < 0) return interaction.reply({ content: "Invalid warn amount", ephemeral: true })

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    warnsBeforeMute: warns
                })

                const embed = new EmbedBuilder()
                .setColor(color)
                
                if(warns == 0) {
                    embed.setDescription("<:no:979193272784265217> You have disabled automatic muting.")
                } else {
                    embed.setDescription(`<:yes:979193272612298814> You have set the threshhold to \`${warns}\``)
                }
                interaction.reply({ embeds: [embed] })
                break;
        }

    }
}