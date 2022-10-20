import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, UserResolvable, TextChannel, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban any user.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("You you'd like to unban.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

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
        if(thePermit?.commandAccess.includes("UNBAN") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("UNBAN") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: "I do not have permission to unban members!", ephemeral: true })
        
        let user = interaction.options.getUser("user")
        if (!user) return interaction.reply({ content: "Invalid user! How?", ephemeral: true })

        let ban = interaction.guild.bans.cache.get(user.id)
        if (!ban) return interaction.reply({ content: "That user is not banned!", ephemeral: true })

        const unbanned = new EmbedBuilder()
            .setColor(color)
            .setDescription(`**${user.username}** has been unbanned!`)
        interaction.reply({ embeds: [unbanned] })

        interaction.guild.members.unban(user.id as UserResolvable)

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Member Unbanned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
            .setThumbnail(user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
            > [${user.id}]
            > [<@${user.id}>]

            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Unban

            **Channel:** <#${interaction.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
        if (!channel) { return; }
        if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
        }

    }
}