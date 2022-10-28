import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("[PREMIUM] Set the default embed color for Boolean to anything you want!")
        .addStringOption(choice =>
            choice.setName("color")
                .setRequired(true)
                .setDescription("Hex code. Or reset it!")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if(!settings) return interaction.reply({  content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })
        
        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if(settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if (permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if (hasRole == true) break;
        }

        for (const permit of permits) {
            if (permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("COLOR") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("COLOR") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const noPremium = new EmbedBuilder()
            .setDescription("Whoops! Looks like this server does not have premium enabled!")
            .setColor("Gold")
        if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) return interaction.reply({ embeds: [noPremium], ephemeral: true })


        let embedColor = interaction.options.getString("color")
        if (embedColor?.toLowerCase() == "reset") {
            await Settings.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                guildSettings: {
                    embedColor: "5865F2"
                }
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You set the embed color to `#5865F2`!")
                .setColor("5865F2" as ColorResolvable)
            interaction.reply({ embeds: [reset] })
        }

        if (!embedColor?.toLowerCase().startsWith("#")) return interaction.reply({ content: "Invalid hex code! EX. `#000000`", ephemeral: true })

        embedColor = embedColor.replace("#", "");

        if (!/[0-9A-Fa-f]{6}/g.test(embedColor)) return interaction.reply({ content: "Invalid hex code! EX. `#000000`", ephemeral: true })

        await Settings.findOneAndUpdate({
            guildID: interaction.guild.id
        }, {
            guildSettings: {
                embedColor: embedColor
            }
        })
        const success = new EmbedBuilder()
            .setDescription(`<:yes:979193272612298814> You set the embed color to \`#${embedColor}\`!`)
            .setColor(embedColor as ColorResolvable)
        interaction.reply({ embeds: [success] })

    }
}