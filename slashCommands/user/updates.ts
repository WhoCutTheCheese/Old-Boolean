import { SlashCommandBuilder, CommandInteraction, Client, EmbedBuilder, ColorResolvable, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent } from "discord.js";
import Configuration from "../../models/config";
const bot = require("../../package.json");
const _ = require("lodash");
let Updates = require("../../json/updates.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updates")
        .setDescription("View all of Boolean's recent updates!"),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        let updatesArray = _.chunk(Updates, 2)

        let numbers = 0

        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`left.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("◀"),
                new ButtonBuilder()
                    .setCustomId(`end_interaction.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("✖"),
                new ButtonBuilder()
                    .setCustomId(`right.${interaction.user.id}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("▶"),
            )

        const updateEmbed = new EmbedBuilder()
            .setTitle(":newspaper: Change Logs")
            .setColor("Blurple")
            .setDescription(`\`Latest Version: v${bot.version}\`${updatesArray[numbers]}`)
        const updatesReply = await interaction.reply({ embeds: [updateEmbed], components: [row as ActionRowBuilder<ButtonBuilder>], fetchReply: true })

        const filter = (i: any) => i.user.id === interaction.user.id;

        const collector = updatesReply.createMessageComponentCollector({ filter, time: 20000 });

        collector.on("collect", async buttonInteraction => {
            await buttonInteraction.deferUpdate()
            switch (buttonInteraction.customId) {
                case `left.${buttonInteraction.user.id}`:
                    if (numbers === 0) return;
                    numbers = numbers - 1
                    const updatesEmbed = new EmbedBuilder()
                        .setTitle(":newspaper: Change Logs")
                        .setDescription(`\`Latest Version: v${bot.version}\`${updatesArray[numbers]}`)
                    interaction.editReply({ embeds: [updatesEmbed], components: [row] })
                    break;
                case `end_interaction.${buttonInteraction.user.id}`:
                    row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            ButtonBuilder.from(updatesReply.components[0].components[0] as APIButtonComponent).setDisabled(true),
                            ButtonBuilder.from(updatesReply.components[0].components[1] as APIButtonComponent).setDisabled(true),
                            ButtonBuilder.from(updatesReply.components[0].components[2] as APIButtonComponent).setDisabled(true),
                        )
                    const endedInteractioin = new EmbedBuilder()
                        .setTitle(":newspaper: Change Logs")
                        .setDescription(`\`Latest Version: v${bot.version}\`${updatesArray[numbers]}`)
                        .setFooter({ text: "Interaction Timed Out" })
                    interaction.editReply({ embeds: [endedInteractioin], components: [row] })
                    break;
                case `right.${buttonInteraction.user.id}`:
                    numbers = numbers + 1
                    if (updatesArray[numbers] == null) { numbers = numbers - 1; return; }
                    const historyEmbed2 = new EmbedBuilder()
                        .setTitle(":newspaper: Change Logs")
                        .setDescription(`\`Latest Version: v${bot.version}\`${updatesArray[numbers]}`)
                    interaction.editReply({ embeds: [historyEmbed2], components: [row] })
                    break;
                default:
                    buttonInteraction.reply({ content: "This is not your embed!", ephemeral: true })
            }
        })

        collector.on("end", buttonInteraction => {
            row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    ButtonBuilder.from(updatesReply.components[0].components[0] as APIButtonComponent).setDisabled(true),
                    ButtonBuilder.from(updatesReply.components[0].components[1] as APIButtonComponent).setDisabled(true),
                    ButtonBuilder.from(updatesReply.components[0].components[2] as APIButtonComponent).setDisabled(true),
                )
            const historyEmbed2 = new EmbedBuilder()
                .setTitle(":newspaper: Change Logs")
                .setDescription(`\`Latest Version: v${bot.version}\`${updatesArray[numbers]}`)
                .setFooter({ text: "Interaction Timed Out" })
            interaction.editReply({ embeds: [historyEmbed2], components: [row] })
        })

    }
}