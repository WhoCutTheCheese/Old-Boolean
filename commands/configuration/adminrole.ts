import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, ActionRowBuilder, ButtonBuilder, ButtonStyle, APIButtonComponent, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adminrole")
        .setDescription("Add a admin role. Admin roles allow users to use administration commands.")
        .addStringOption(choice =>
            choice.setName("sub_command")
                .setRequired(true)
                .setDescription("Chose what action you would like to take.")
                .addChoices(
                    { name: "Add Role", value: "add" },
                    { name: "Remove Role", value: "remove" },
                    { name: "Reset Roles", value: "reset" },
                    { name: "View Roles", value: "view" }
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

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) return

        const subCommand = interaction.options.getString("sub_command")

        const role = interaction.options.getRole("role")

        switch (subCommand) {
            case "add":
                if (!role) return interaction.reply({ content: "You must input a valid role!", ephemeral: true })

                if (configuration?.adminRoleID.includes(role.id)) return interaction.reply({ content: "This role is already defined as a admin role!", ephemeral: true })

                if (configuration?.adminRoleID.length! > 5) return interaction.reply({ content: "You've reached the maximum allowed admin roles!", ephemeral: true })

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    $push: { adminRoleID: role.id }
                }).catch((err: Error) => console.error(err))

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:yes:979193272612298814> You've successfully added <@&${role.id}> as a admin role!`)
                interaction.reply({ embeds: [embed] })

                break;
            case "remove":
                if (!role) return interaction.reply({ content: "You must input a valid role!", ephemeral: true })

                if (!configuration?.adminRoleID.includes(role.id)) return interaction.reply({ content: "This role is not defined as a admin role.", ephemeral: true })

                const roles = configuration.adminRoleID
                const index = roles.indexOf(role.id)

                if (index > -1) {
                    roles.splice(index, 1)
                }

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id,
                }, {
                    adminRoleID: roles
                })

                const removed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<:no:979193272784265217> You've successfully removed <@&${role.id}> as a admin role!`)
                interaction.reply({ embeds: [removed] })

                break;
            case "reset":

                let row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`confirm.${interaction.user.id}`)
                            .setEmoji("✖")
                            .setLabel("CONFIRM")
                    )
                const confirm = new EmbedBuilder()
                    .setTitle("Reset All admin Roles?")
                    .setColor(color)
                    .setDescription("This will delete all admin roles from Boolean's database.")
                    .setTimestamp()
                const buttonMessage = await interaction.reply({ embeds: [confirm], components: [row], fetchReply: true })

                const filter = (i: any) => i.user.id === interaction.user.id;

                const collector = buttonMessage.createMessageComponentCollector({ filter, time: 15000 });

                collector.on("collect", async buttonInteraction => {
                    await buttonInteraction.deferUpdate()
                    if (buttonInteraction.customId == `confirm.${buttonInteraction.user.id}`) {
                        row = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                ButtonBuilder.from(buttonMessage.components[0].components[0] as APIButtonComponent).setDisabled(true)
                            )
                        const confirm = new EmbedBuilder()
                            .setTitle("Reset All Admin Roles?")
                            .setColor(color)
                            .setDescription("This will delete all admin roles from Boolean's database.")
                            .setTimestamp()
                        interaction.editReply({ embeds: [confirm], components: [row] })

                        await Configuration.findOneAndUpdate({
                            guildID: interaction.guild.id
                        }, {
                            adminRoleID: []
                        })

                    }
                })

                break;
            case "view":
                let array: string[] = []
                for (const arr of configuration?.modRoleID!) {
                    array.push(` <@&${arr}>`)
                }

                const view = new EmbedBuilder()
                    .setTitle("Current Mod Roles")
                    .setColor(color)
                    .setDescription(`**Roles:**${array}`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
                interaction.reply({ embeds: [view] })
                break;
        }

    }
}