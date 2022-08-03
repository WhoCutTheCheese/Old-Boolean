import { ICommand } from "wokcommands";
import { Channel, Guild, Invite, MessageEmbed, TextChannel } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
export default {
    category: "Administration",
    description: "Get information about your current guild.",
    slash: "both",
    aliases: [],
    maxArgs: 0,
    cooldown: "5s",
    ownerOnly: true,
    hidden: true,

    callback: async ({ message, interaction, client }) => {
        try {
            if (message) {
                client.guilds.cache.forEach(async (guilds: Guild) => {
                    console.log(guilds.name)
                    console.log(guilds.memberCount)
                    console.log(guilds.id)
                    let guild = client.guilds.cache.get(guilds.id)
                    const channel = guild?.channels.cache.filter((channel: Channel) => channel.type === 'GUILD_TEXT').first();
                    let invite = await (channel as TextChannel).createInvite({ maxUses: 1, })
                    console.log(invite)
                })
                return true;
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                const caseCount = await Cases.countDocuments({
                    guildID: interaction.guild?.id,
                })
                console.log(caseCount)
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand