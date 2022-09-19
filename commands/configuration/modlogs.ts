import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("modlogs")
        .setDescription("Edit Boolean's mod logging channel.")
        .addStringOption(string =>
            string.setName("subcommand")
                .setDescription("Select an option.")
                .setRequired(true)
                .addChoices(
                    { name: "Set Log Channel", value: "set" },
                    { name: "Delete Log Channel", value: "delete" },
                    { name: "View Current Log Channel", value: "view" }
                )
        )
        .addChannelOption(channel =>
            channel.setName("channel")
                .setDescription("Channel you would like to set as mod logging channel.")
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

        if (hasRoles == false) { return interaction.reply({ content: "You do not have permission to do this!", ephemeral: true }) };

        if(!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) return interaction.reply({ content: "I can talk!", ephemeral: true })

        const subCommand = interaction.options.getString("subcommand");

        const channel = interaction.options.getChannel("channel");

        switch (subCommand) {
            case "set":

                if(!channel) return interaction.reply({ content: "You need to specify a valid channel!", ephemeral: true })

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    modLogChannel: channel.id
                })

                const success = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> You have set the mod logging channel to <#${channel.id}>!`)
                    .setColor(color)
                interaction.reply({ embeds: [success] })
                
                break;
            case "delete":

                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    modLogChannel: "None"
                })

                const deleted = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> You have deleted the mod logging channel!`)
                    .setColor(color)
                interaction.reply({ embeds: [deleted] })

                break;
            case "view":

                const view = new EmbedBuilder()
                    .setTitle("Mod Logging")
                    .setDescription(`**Log Channel:** **<#${configuration?.modLogChannel}>**`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
                    .setColor(color)
                interaction.reply({ embeds: [view] })

                break;
        }

    }
}