import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits, messageLink } from "discord.js";
import Settings from "../../models/settings";
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

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

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

                if(!warns) return interaction.reply({ content: "Please provide a valud number! Ex. `/automute Warns Before Mute 3`" })
                if(isNaN(Number(warns))) return interaction.reply({ content: "Please provide a valid number! Ex. \`/automute Warns Before Mute 3\`", ephemeral: true })

                await Settings.findOneAndUpdate({
                    guildID: interaction.guild?.id
                }, {
                    modSettings: {
                        warnsBeforeMute: warns
                    }
                })

                const embed = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Warns before mute is now set to \`${warns}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [embed] })

                break;
        }

    }
}