import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, EmbedBuilder, TextChannel, PermissionFlagsBits } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Set the nickname of any user in your guild.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("Target user.")
        )
        .addStringOption(newNick =>
            newNick.setName("nickname")
                .setDescription("New nickname for target user. Or reset it by inputting \"reset\"!")
                .setRequired(true)
                .setMaxLength(32)
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
        if (thePermit?.commandAccess.includes("NICKNAME") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("NICKNAME") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({ content: "I do not have permission to edit nicknames!" })

        let nickname = interaction.options.getString("nickname")
        if (nickname?.length! > 32) return interaction.reply({ content: "New nickname exceeds maximum length. (32 Characters)", ephemeral: true })

        let member = interaction.guild.members.cache.get(interaction.options.getUser("user")?.id!)
        if (!member) return interaction.reply({ content: "This user is not in the guild.", ephemeral: true })

        if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ content: "I cannot change this user's nickname", ephemeral: true })

        if (interaction.member.roles.highest.position < member.roles.highest.position) return interaction.reply({ content: "You cannot change this user's nickname", ephemeral: true })

        if (nickname?.toLocaleLowerCase() === "reset") {

            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Nickname Updated - ${member.user.tag}`, iconURL: member.user.displayAvatarURL() || undefined })
                .setThumbnail(member.user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${member.user.tag}
                > [${member.user.id}]
                > [<@${member.user.id}>]

                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Nickname
                > [Nickname Reset]

                **Channel:** <#${interaction.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
            let exists = true
            if (!channel) { exists = false; }
            if (exists == true) {
                if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                    (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                }
            }

            member.setNickname(null)

            const nicknameResetEmbed = new EmbedBuilder()
                .setColor(color)
                .setDescription(`**${member?.user.tag}**'s nickname has been reset!`)
            return interaction.reply({ embeds: [nicknameResetEmbed] })
        }

        const modLogs = new EmbedBuilder()
            .setAuthor({ name: `Nickname Updated - ${member.user.tag}`, iconURL: member.user.displayAvatarURL() || undefined })
            .setThumbnail(member.user.displayAvatarURL() || null)
            .setDescription(`<:user:977391493218181120> **User:** ${member.user.tag}
            > [${member.user.id}]
            > [<@${member.user.id}>]

            <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Nickname
            > [**New Nickname:** ${nickname}]

            **Channel:** <#${interaction.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
            .setColor(color)
            .setTimestamp()
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel);
        let exists = true
        if (!channel) { exists = false; }
        if (exists == true) {
            if (interaction.guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }

        member.setNickname(nickname)

        const nicknameSetEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(`**${member?.user.tag}**'s nickname has been set to \`${nickname}\`!`)
        return interaction.reply({ embeds: [nicknameSetEmbed] })

    }
}