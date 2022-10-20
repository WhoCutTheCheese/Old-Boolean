import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import Configuration from "../../models/config";
import Permits from "../../models/permits";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteusage")
        .setDescription("Delete legacy command usage after a command is ran.")
        .addBooleanOption(option => option.setName("boolean").setDescription("True or False").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable;

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
        if (thePermit?.commandAccess.includes("DELETEUSAGE") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("DELETEUSAGE") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const boolean = interaction.options.getBoolean("boolean") as boolean;

        if(boolean == true) {

            await Configuration.findOneAndUpdate({
                guildID: interaction.guild.id
            }, {
                deleteCommandUsage: true
            })

            const embed = new EmbedBuilder()
                .setColor(color)
                .setDescription("<:yes:979193272968300594> Boolean will now delete legacy command usage after `3 seconds`.")
            return interaction.reply({ embeds: [embed] })

        } else if(boolean == false) {
                
                await Configuration.findOneAndUpdate({
                    guildID: interaction.guild.id
                }, {
                    deleteCommandUsage: false
                })
    
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription("<:no:979193272784265217> Boolean will no longer delete legacy command usage.")
                return interaction.reply({ embeds: [embed] })
    
            }

    }
}