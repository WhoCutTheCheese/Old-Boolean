import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joinrole")
        .setDescription("User is given a role when they join.")
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
        if(thePermit?.commandAccess.includes("JOINROLE") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("JOINROLE") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subcommand = interaction.options.getString("subcommand")
        const role = interaction.options.getRole("role")

        switch(subcommand) {
            case "set":
        
            if(!role) return interaction.reply({ content: "Invalid role!", ephemeral: true })
            
            await Configuration.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                joinRoleID: role.id
            })

            const success = new EmbedBuilder()
                .setDescription("<:yes:979193272612298814> You set the join role to `" + role.name + "`!")
                .setColor(color)
            interaction.reply({ embeds: [success] })

            break;
        case "reset":

            await Configuration.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                joinRoleID: "None"
            })

            const reset = new EmbedBuilder()
                .setDescription("<:no:979193272784265217> You have reset the join role!")
                .setColor(color)
            interaction.reply({ embeds: [reset] })

            break;
        case "view":

            let roleE
            if(configuration?.joinRoleID == "None") {
                roleE = "None"
            } else {
                roleE = `<@&${configuration?.joinRoleID}>`
            }

            const view = new EmbedBuilder()
                .setTitle("Join Role")
                .setColor(color)
                .setDescription(`**Current Role:** ${roleE}`)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
            interaction.reply({ embeds: [view] })

            break;
        }

    }
}