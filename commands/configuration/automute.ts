import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

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

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) return

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