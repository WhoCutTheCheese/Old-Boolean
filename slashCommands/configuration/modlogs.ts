import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, Embed, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
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
        if(thePermit?.commandAccess.includes("MODLOGS") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("MODLOGS") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const subCommand = interaction.options.getString("subcommand");

        const channel = interaction.options.getChannel("channel");

        switch (subCommand) {
            case "set":

                if(!channel) return interaction.reply({ content: "You need to specify a valid channel!", ephemeral: true })

                await Settings.findOneAndUpdate({
                    guildID: interaction.guild?.id
                }, {
                    modSettings: {
                        modLogChannel: channel.id
                    }
                })

                const success = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> You have set the mod logging channel to <#${channel.id}>!`)
                    .setColor(color)
                interaction.reply({ embeds: [success] })
                
                break;
            case "delete":

                await Settings.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    modSettings: {
                        $unset: { modLogChannel: "" }
                    }
                })

                const deleted = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> You have deleted the mod logging channel!`)
                    .setColor(color)
                interaction.reply({ embeds: [deleted] })

                break;
            case "view":
                let mChannel = settings.modSettings?.modLogChannel
                if(!mChannel) mChannel = "None"
                const view = new EmbedBuilder()
                    .setTitle("Mod Logging")
                    .setDescription(`**Log Channel:** **<#${mChannel}>**`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
                    .setColor(color)
                interaction.reply({ embeds: [view] })

                break;
        }

    }
}