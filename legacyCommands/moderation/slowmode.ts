import { Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ["slowmode", "slow"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Seconds]",
    commandName: "SLOWMODE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {
        if(!message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.channel.send({ content: "I cannot edit slowmode!" })

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        if (isNaN(Number(args[0]))) return message.channel.send({ content: "Invalid number of seconds!" });
        if (Number(args[0]) < 0) return message.channel.send({ content: "Invalid timeframe." })

        message.react(`<:yes:979193272612298814>`)
        
        const modLogs = new EmbedBuilder()
        .setAuthor({ name: `Channel Slowmode Updated`, iconURL: message.author.displayAvatarURL() || undefined })
        .setDescription(`<:folder:977391492790362173> **Mod:** ${message.author.tag}
            > [${message.author.id}]
            > [<@${message.author.id}>]
            
            <:pencil:977391492916207636> **Action:** Slowmode
            > [**Old Slowmode:** ${(message.channel as TextChannel).rateLimitPerUser} second(s)]
            > [**New Slowmode:** ${args[0]} second(s)]
            
            **Channel:** <#${(message.channel as TextChannel)?.id}>
            **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
        .setColor(color)
        .setTimestamp()
        const channel1 = message.guild?.channels.cache.find((c: any) => c.id === settings.modSettings?.modLogChannel!);
        let exists = true
        if (!channel1) { exists = false; }
        if (exists == true) {
            if (message.guild?.members.me?.permissionsIn((channel1! as TextChannel)).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (message.guild?.channels.cache.find((c: any) => c.id === channel1?.id) as TextChannel).send({ embeds: [modLogs] })
            }
        }
        (message.channel as TextChannel).setRateLimitPerUser(Number(args[0]), `Slowmode set by ${message.author.tag}`).catch((err: Error) => console.error(err));
        
    }
}