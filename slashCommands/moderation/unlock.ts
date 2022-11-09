import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Add permission for @everyone to speak in a channel.")
        .addChannelOption(channel =>
            channel.setName("channel")
                .setRequired(false)
                .setDescription("Select the channel you'd like to unlock.")
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
        if (thePermit?.commandAccess.includes("UNLOCK") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("UNLOCK") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.SendMessages])) return interaction.reply({ content: "I cannot lock this channel!" })

        const channel = interaction.options.getChannel("channel");

        if (!channel) {

            const locked = new EmbedBuilder()
                .setColor(color)
                .setDescription(`<:yes:979193272612298814> Channel unlocked!`);
            interaction.reply({ embeds: [locked] })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

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
            ((interaction.channel as TextChannel).permissionOverwrites).edit((interaction.channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => console.error(err))

        } else {
            const locked = new EmbedBuilder()
                .setColor(color)
                .setDescription(`<:yes:979193272612298814> Channel unlocked!`);
            (channel as TextChannel).send({ embeds: [locked] })

            interaction.reply({ content: `**#${channel.name}** has been unlocked!`, ephemeral: true })

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Channel Unlocked`, iconURL: interaction.user.displayAvatarURL() || undefined })
                .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Unlock

                **Channel:** <#${channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel1 = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
            if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }
            ((channel as TextChannel).permissionOverwrites).edit((channel as TextChannel).guild.id, {
                SendMessages: null
            }).catch((err: Error) => console.error(err))
        }

    }
}