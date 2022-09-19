import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Set whether or not Boolean will DM users when they are issued punishments.")
        .addBooleanOption(boolean =>
            boolean.setName("boolean")
                .setRequired(true)
                .setDescription("True or false.")
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

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) return interaction.reply({ content: "I cant send messages!", ephemeral: true })

        const boolean = interaction.options.getBoolean("boolean") as boolean;

        await Configuration.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            dmOnPunish: boolean
        })

        if (boolean == true) {
            const yes = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:yes:979193272612298814> Boolean will now DM users when issued a punishment.")
            interaction.reply({ embeds: [yes] })
        } else {
            const yes = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:no:979193272784265217> Boolean will no longer DM users when issued a punishment.")
            interaction.reply({ embeds: [yes] })
        }

    }
}