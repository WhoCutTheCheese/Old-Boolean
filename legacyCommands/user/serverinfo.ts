import { Client, ColorResolvable, EmbedBuilder, GuildMember, GuildVerificationLevel, Message, TextChannel } from "discord.js";
import Settings from "../../models/settings";

module.exports = {
    commands: ['serverinfo', 'si', 'server'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
        
        message.guild?.members.fetch().then((fetchedMembers: any) => {
            const totalMembers = fetchedMembers

            let verifLevel
            if (message.guild?.verificationLevel == GuildVerificationLevel.None) { verifLevel = "None" }
            if (message.guild?.verificationLevel == GuildVerificationLevel.Low) { verifLevel = "Low" }
            if (message.guild?.verificationLevel == GuildVerificationLevel.Medium) { verifLevel = "Medium" }
            if (message.guild?.verificationLevel == GuildVerificationLevel.High) { verifLevel = "(╯°□°）╯︵  ┻━┻" }
            if (message.guild?.verificationLevel == GuildVerificationLevel.VeryHigh) { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }
            const botCount = message.guild?.members.cache.filter((member: GuildMember) => !member.user.bot).size.toLocaleString();
            const botCount2 = message.guild?.members.cache.filter((member: GuildMember) => member.user.bot).size.toLocaleString();
            let serverIcon
            const serverInfoEmbed = new EmbedBuilder()
                .setAuthor({ name: `${message.guild?.name} Information`, iconURL: message.guild?.iconURL() || undefined})
                .setThumbnail(message.guild?.iconURL() || client.user?.displayAvatarURL() || null)
                .setColor(color)
                .addFields(
                    { name: "Name:", value: `${message.guild?.name}`, inline: true },
                    { name: "ID:", value: `${message.guild?.id}`, inline: true },
                    { name: "Owner:", value: `<@${message.guild?.ownerId}>`, inline: true },
                    { name: "Members:", value: `**${totalMembers.size.toLocaleString()}** total members,\n**${botCount}** total humans,\n**${botCount2}** total bots`, inline: false },
                    { name: "Emojis:", value: `${message.guild?.emojis.cache.size}`, inline: true },
                    { name: "Roles:", value: `${message.guild?.roles.cache.size.toLocaleString()}`, inline: true },
                    { name: "Channels:", value: `${message.guild?.channels.cache.size.toLocaleString()}`, inline: true },
                    { name: "Verification Level:", value: `${verifLevel}`, inline: true },
                    { name: "Creation Date:", value: `<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:R>)`, inline: true },
                )
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [serverInfoEmbed] })
        })

    },
}