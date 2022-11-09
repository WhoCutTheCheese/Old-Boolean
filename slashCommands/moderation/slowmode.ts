import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, PermissionFlagsBits, User, messageLink, TextChannel } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Edit the slowmode of any channel.")
        .addNumberOption(seconds =>
            seconds.setName("seconds")
                .setRequired(true)
                .setDescription("Enter the number of seconds to set the slowmode.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })
        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: "I don't have the `Manage Channels` permission!", ephemeral: true })

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
        if (thePermit?.commandAccess.includes("CASE") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("CASE") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const seconds = interaction.options.getNumber("seconds")
        if (seconds == null || seconds == undefined) return interaction.reply({ content: "Please enter a valid number of seconds!", ephemeral: true });
        if (seconds < 0) return interaction.reply({ content: "You can't set a negative slowmode!", ephemeral: true })

        interaction.reply({ content: `Slowmode set to: \`${seconds}\` second(s)`, ephemeral: true })

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Channel Slowmode Updated`, iconURL: interaction.guild.iconURL() || undefined })
            .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Slowmode
            > [**Old Slowmode:** ${interaction.channel?.rateLimitPerUser} second(s)]
            > [**New Slowmode:** ${seconds} second(s)]

            **Channel:** <#${interaction.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

        interaction.channel?.setRateLimitPerUser(seconds)

    }
}