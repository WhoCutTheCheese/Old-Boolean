import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

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