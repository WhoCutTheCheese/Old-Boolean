import { SlashCommandBuilder, Client, PermissionsBitField, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowComponent, Message, Interaction, ButtonInteraction, ButtonComponent, AnyComponentBuilder, APIButtonComponent, APIActionRowComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Cases from "../../models/cases";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteallcases")
        .setDescription("Delete all case files stored by Boolean.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild) { return interaction.reply({ content: "You can only used this in cached guilds.", ephemeral: true }) }
        if (interaction.user.id !== interaction.guild?.ownerId) { return interaction.reply({ content: "You do not have permission to do this!", ephemeral: true }); }

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("CONFIRM")
                    .setLabel("Confirm")
                    .setEmoji("🛑")
            )



        const areYouSureEmbed = new EmbedBuilder()
            .setTitle("Warning!!!")
            .setDescription("This will delete ALL of Boolean's saved case data. This means Boolean will not longer be able to fetch any data on punishments issued.\n\n**Are you sure?**")
            .setColor(configuration?.embedColor as ColorResolvable)
        const buttonMessage = await interaction.reply({ embeds: [areYouSureEmbed], components: [row], fetchReply: true })

        const filter = (i: any) => i.user.id === interaction.user.id;

        const collector = buttonMessage.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId == "CONFIRM") {
                if (buttonInteraction.user.id === interaction.user.id) {
                    row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            ButtonBuilder.from(buttonMessage.components[0].components[0] as APIButtonComponent).setDisabled(true)
                        )
                    const areYouSureEmbed = new EmbedBuilder()
                        .setTitle("Deleted All Cases")
                        .setDescription("All saved punishment data has been wiped.")
                        .setColor(configuration?.embedColor as ColorResolvable)
                    interaction.deleteReply()
                    await buttonInteraction.reply({ embeds: [areYouSureEmbed], components: [row as ActionRowBuilder<ButtonBuilder>] })
                    await GuildProperties.findOneAndUpdate({
                        guildID: interaction.guild?.id
                    }, {
                        totalCases: 0
                    })
                    await Cases.deleteMany({
                        guildID: interaction.guild?.id
                    })
                }
            }
        })

    }
}