import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
export default {
    category: "Configuration",
    description: "Change whether or not Boolean will dm a user when punished.",
    slash: "both",
    aliases: ['dmonpunish'],
    minArgs: 1,
    expectedArgs: "[true/false]",
    cooldown: "5s",
    options: [
        {
            name: "boolean",
            description: 'true/false.',
            required: true,
            type: 'BOOLEAN',
        },
    ],

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const configuration = await Config.findOne({
                    guildID: message.guild?.id
                })
                if (args[0] == "true") {
                    if (configuration.dmOnPunish === true) { message.channel.send("<:recommended:979475658000437258> Boolean will already DM people when they are punished.")
                return; }
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        dmOnPunish: true
                    })
                    message.channel.send("<:yes:979193272612298814> Boolean will now DM people on punishment.")
                    return;
                } else if (args[0] == "false") {
                    if (configuration.dmOnPunish === false) { message.channel.send("<:recommended:979475658000437258> Boolean already does not DM people on punishment.")
                    return; }
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        dmOnPunish: false
                    })
                    message.channel.send("<:no:979193272784265217> Boolean will not DM people on punishment.")
                    return;
                } else {
                    message.channel.send("<:recommended:979475658000437258> Not a boolean (true/false)")
                    return;
                }
            } else if (interaction) {
                const configuration = await Config.findOne({
                    guildID: interaction.guild?.id
                })
                if (args[0] == "true") {
                    if (configuration.dmOnPunish === true) { interaction.reply({ content: "<:recommended:979475658000437258> Boolean will already DM people when they are punished.", ephemeral: true})
                return; }
                    await Config.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        dmOnPunish: true
                    })
                    interaction.reply("<:yes:979193272612298814> Boolean will now DM people on punishment.")
                    return;
                } else if (args[0] == "false") {
                    if (configuration.dmOnPunish === false) { interaction.reply({ content: "<:recommended:979475658000437258> Boolean already does not DM people on punishment.", ephemeral: true })
                    return; }
                    await Config.findOneAndUpdate({
                        guildID: interaction.guild?.id,
                    }, {
                        dmOnPunish: false
                    })
                    interaction.reply("<:no:979193272784265217> Boolean will not DM people on punishment.")
                    return;
                } else {
                    interaction.reply({ content: "<:recommended:979475658000437258> Not a boolean (true/false)", ephemeral: true })
                    return;
                }
            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand