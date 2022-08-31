import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
export default {
    category: "User",
    description: "Get information about your current guild.",
    slash: "both",
    aliases: ['server-info', 'sinfo'],
    maxArgs: 0,
    cooldown: "5s",

    callback: async ({ message, interaction, client }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                message.guild?.members.fetch().then((fetchedMembers: any) => {
                    const totalMembers = fetchedMembers

                    let verifLevel
                    if (message.guild?.verificationLevel == "NONE") { verifLevel = "None" }
                    if (message.guild?.verificationLevel == "LOW") { verifLevel = "Low" }
                    if (message.guild?.verificationLevel == "MEDIUM") { verifLevel = "Medium" }
                    if (message.guild?.verificationLevel == "HIGH") { verifLevel = "(╯°□°）╯︵  ┻━┻" }
                    if (message.guild?.verificationLevel == "VERY_HIGH") { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }
                    const botCount = message.guild?.members.cache.filter((member: any) => !member.user.bot).size.toLocaleString();
                    const botCount2 = message.guild?.members.cache.filter((member: any) => member.user.bot).size.toLocaleString();
                    const serverinfo = new MessageEmbed()
                        .setAuthor({ name: message.guild!.name, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                        .setThumbnail(message.guild?.iconURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .addField("Name", message.guild!.name, true)
                        .addField("ID", message.guild!.id, true)
                        .addField("Owner", `<@${message.guild?.ownerId}>`, true)
                        .addField("Members", `**${totalMembers.size.toLocaleString()}** total members,\n**${botCount}** total humans,\n**${botCount2}** total bots`)
                        .addField("Emojis", `${message.guild?.emojis.cache.size.toLocaleString()}`, true)
                        .addField("Channels", `${message.guild?.channels.cache.size.toLocaleString()}`, true)
                        .addField("Roles", `${message.guild?.roles.cache.size.toLocaleString()}`, true)
                        .addField("Verification Level", `${verifLevel}`, true)
                        .addField("Creation Date", `<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((message.channel as TextChannel).guild.createdAt.getTime() / 1000)}:R>)`, true)
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                    message.channel.send({ embeds: [serverinfo] })
                });
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                interaction.guild?.members.fetch().then((fetchedMembers: any) => {
                    const totalMembers = fetchedMembers


                    let verifLevel
                    if (interaction.guild?.verificationLevel == "NONE") { verifLevel = "None" }
                    if (interaction.guild?.verificationLevel == "LOW") { verifLevel = "Low" }
                    if (interaction.guild?.verificationLevel == "MEDIUM") { verifLevel = "Medium" }
                    if (interaction.guild?.verificationLevel == "HIGH") { verifLevel = "(╯°□°）╯︵  ┻━┻" }
                    if (interaction.guild?.verificationLevel == "VERY_HIGH") { verifLevel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }
                    const botCount = interaction.guild?.members.cache.filter((member: any) => !member.user.bot).size.toLocaleString();
                    const botCount2 = interaction.guild?.members.cache.filter((member: any) => member.user.bot).size.toLocaleString();
                    const serverinfo = new MessageEmbed()
                        .setAuthor({ name: interaction.guild!.name, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                        .setThumbnail(interaction.guild?.iconURL({ dynamic: true }) || "")
                        .setColor(configuration.embedColor)
                        .addField("Name", interaction.guild!.name, true)
                        .addField("ID", interaction.guild!.id, true)
                        .addField("Owner", `<@${interaction.guild?.ownerId}>`, true)
                        .addField("Members", `**${totalMembers.size.toLocaleString()}** total members,\n**${botCount}** total humans,\n**${botCount2}** total bots`)
                        .addField("Emojis", `${interaction.guild?.emojis.cache.size.toLocaleString()}`, true)
                        .addField("Channels", `${interaction.guild?.channels.cache.size.toLocaleString()}`, true)
                        .addField("Roles", `${interaction.guild?.roles.cache.size.toLocaleString()}`, true)
                        .addField("Verification Level", `${verifLevel}`, true)
                        .addField("Creation Date", `<t:${Math.floor((interaction.channel as TextChannel).guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor((interaction.channel as TextChannel).guild.createdAt.getTime() / 1000)}:R>)`, true)
                        .setFooter({ text: `Requested by ${interaction.user?.tag}`, iconURL: interaction.guild?.iconURL({ dynamic: true }) || "" })
                    interaction.reply({ embeds: [serverinfo] })
                });
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand