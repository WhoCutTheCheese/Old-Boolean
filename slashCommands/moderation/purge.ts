import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Configuration from "../../models/config"
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purge messages.")
        .addNumberOption(string =>
            string.setName("limit")
                .setRequired(true)
                .setDescription("Set the limit for how many messages to delete.")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })

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
        if(thePermit?.commandAccess.includes("PURGE") || thePermit?.commandAccess.includes("MODERATION")) hasPermit = true;
        if(thePermit?.commandBlocked.includes("PURGE") || thePermit?.commandBlocked.includes("MODERATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: "I do not have permission to delete messages!", ephemeral: true })

        let amount = interaction.options.getNumber("limit");

        if (!amount) { return interaction.reply({ content: "Not a valid limit!", ephemeral: true }) }

        if (amount > 100 || amount < 1) { return interaction.reply({ content: "Limit must be greater than 1 and less than 100", ephemeral: true }) }

        let messages = await interaction.channel?.messages.fetch({ limit: amount });

        interaction.channel?.bulkDelete(messages!).catch((err: Error) => { interaction.channel?.send({ content: "Cannot delete messages over 14 days old!" }); })

        let msg = await interaction.reply({ content: "Deleted **" + amount + "** messages", fetchReply: true })

        setTimeout(() => {
            msg?.delete();
        }, 3000)

        const modLogEmbed = new EmbedBuilder()
            .setAuthor({ name: `Messages Purged`, iconURL: interaction.user.displayAvatarURL() || undefined })
            .setThumbnail(interaction.user.displayAvatarURL() || null)
            .setColor(configuration?.embedColor as ColorResolvable)
            .setTimestamp()
            .setDescription(`<:folder:977391492790362173> **Mod:** ${interaction.user.tag}
            > [${interaction.user.id}]
            > [<@${interaction.user.id}>]

            <:pencil:977391492916207636> **Action:** Purge
            > [**Messages Purged:** ${amount}]
            
            **Channel:** <#${interaction.channel?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel);
        if (!channel) { return; }
        (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] })
    }
}