import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("[PREMIUM] Set the default embed color for Boolean to anything you want!")
        .addStringOption(choice =>
            choice.setName("color")
                .setRequired(true)
                .setDescription("Hex code. Or reset it!")
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
        
        const noPremium = new EmbedBuilder()
            .setDescription("Whoops! Looks like this server does not have premium enabled!")
            .setColor("Gold")
        if(guildProp?.premium == false) return interaction.reply({ embeds: [noPremium], ephemeral: true })

        let hasPerms
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) { hasPerms = false }

        let hasRoles
        if (hasPerms == false) {
            for (const requiredRole of configuration?.adminRoleID!) {
                const role = interaction.guild?.roles.cache.get(requiredRole);
                if (!interaction.member?.roles.cache.has(requiredRole)) {
                    hasRoles = false
                } else {
                    hasRoles = true
                    break;
                }
            }
        }

        if (hasRoles == false) { return interaction.reply({ content: "You do not have permission to do this!", ephemeral: true }) }

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) return interaction.reply({ content: "I cant send messages!", ephemeral: true })

        let embedColor = interaction.options.getString("color")
        if (embedColor?.toLowerCase() == "reset") {
            await Configuration.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                embedColor: "5865F2"
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You set the embed color to `#5865F2`!")
                .setColor("5865F2" as ColorResolvable)
            interaction.reply({ embeds: [reset] })
        }

        if (!embedColor?.toLowerCase().startsWith("#")) return interaction.reply({ content: "Invalid hex code! EX. `#000000`", ephemeral: true })

        embedColor = embedColor.replace("#", "");

        if (!/[0-9A-Fa-f]{6}/g.test(embedColor)) return interaction.reply({ content: "Invalid hex code! EX. `#000000`", ephemeral: true })

        await Configuration.findOneAndUpdate({
            guildID: interaction.guild.id
        }, {
            embedColor: embedColor
        })
        const success = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> You set the embed color to \`#${embedColor}\`!`)
            .setColor(embedColor as ColorResolvable)
        interaction.reply({ embeds: [success] })

    }
}