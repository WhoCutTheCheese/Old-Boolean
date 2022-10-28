import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("muterole")
        .setDescription("Add Set the role boolean adds when someone is permanently muted.")
        .addStringOption(choice =>
            choice.setName("subcommand")
                .setRequired(true)
                .setDescription("Chose what action you would like to take.")
                .addChoices(
                    { name: "Set Role", value: "set" },
                    { name: "Reset Role", value: "reset" },
                    { name: "View Role", value: "view" }
                )
        )
        .addRoleOption(role =>
            role.setName("role")
                .setDescription("Chose a role. Not needed if you are resetting.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
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
        if(thePermit?.commandAccess.includes("MUTEROLE") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("MUTEROLE") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subcommand = interaction.options.getString("subcommand")
        const role = interaction.options.getRole("role")

        switch(subcommand) {
            case "set":
        
            if(!role) return interaction.reply({ content: "Invalid role!", ephemeral: true })
            
            await Settings.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                modSettings: {
                    muteRole: role.id
                }
            })

            const success = new EmbedBuilder()
                .setDescription("<:yes:979193272612298814> You set the mute role to `" + role.name + "`!")
                .setColor(color)
            interaction.reply({ embeds: [success] })

            break;
        case "reset":

            await Settings.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                modSettings: {
                    $unset: { muteRole: "" }
                }
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You have reset the mute role!")
                .setColor(color)
            interaction.reply({ embeds: [reset] })

            break;
        case "view":

            let roleE
            if(settings.modSettings?.muteRole) {
                roleE = "None"
            } else {
                roleE = `<@&${settings.modSettings?.muteRole}>`
            }

            const view = new EmbedBuilder()
                .setTitle("Mute Role")
                .setColor(color)
                .setDescription(`**Current Role:** ${roleE}`)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            interaction.reply({ embeds: [view] })

            break;
        }

    }
}