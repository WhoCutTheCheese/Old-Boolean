import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Set whether or not Boolean will DM users when they are issued punishments.")
        .addBooleanOption(boolean =>
            boolean.setName("boolean")
                .setRequired(true)
                .setDescription("True or false.")
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
        if(thePermit?.commandAccess.includes("DM") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("DM") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

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