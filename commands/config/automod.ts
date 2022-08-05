import { ICommand } from "wokcommands";
import { ColorResolvable, MessageEmbed, Permissions } from "discord.js";
import Config from "../../models/config";
import Cases from "../../models/cases";
import Guild from "../../models/guild";
const slurs = require("../../json/slurs.json");
import automodConfig from "../../models/automodConfig";
export default {
    category: "Configuration",
    description: "Edit automod settings.",
    permissions: ["MANAGE_GUILD"],
    slash: "both",
    maxArgs: 2,
    cooldown: "5s",
    ownerOnly: true,

    callback: async ({ message, interaction, client, args }) => {
        try {
            if (message) {
                const aConfig = await automodConfig.findOne({
                    guildID: message.guild?.id,
                })
                const configuration = await Config.findOne({
                    guildID: message.guild?.id,
                })
                if (!aConfig) {
                    const newAutomod = new automodConfig({
                        guildID: message.guild?.id,
                        blockLinks: false,
                        blockSlurs: false,
                        filter: false,
                        blockScams: false,
                        slurList: slurs,
                        filterList: [],
                        websiteWhitelist: ["https://cdn.discordapp.com", "https://discord.com", "https://tenor.com", "https://media.discordapp.net"],
                    })
                    newAutomod.save()
                    return "Boolean has created an automod file for you! Please run the command again."
                }
                if (!args[0]) {
                    const autoModSettings = new MessageEmbed()
                        .setAuthor({ name: "Auto-Moderation Configuration" })
                        .setDescription(`These are the configuration settings for Boolean's automoderation.
                        
                        **__Settings:__**

                        > **Block Links:** ${aConfig.blockLinks}
                        Boolean will automatically warn anyone who sends a link.
                        By default Discord & Tenor are added to the whitelist. But you can add your own options.
                        > **Block Slurs:** ${aConfig.blockSlurs}
                        Boolean will block slurs and mute anyone who says any.
                        This is a separate option from the filter as the punishments are different.
                        > **Block Scams:** ${aConfig.blockScams}
                        This option allows Boolean to block Discord Nitro scams with a preset list.
                        > **Filter:** ${aConfig.filter}
                        These are words that Boolean will moderate for you.
                        Unlike the other options this does not have a preset.
                        
                        **__:octagonal_sign: Lists__**
                        View the list of slurs, filtered words & allowed websites by running \`!!automod lists\``)
                        .setColor(configuration.embedColor)
                    return autoModSettings;
                } else if (args[0] == "lists") {
                    return "ass";
                }
            } else if (interaction) {

            }
        } catch {
            (err: Error) => {
                console.error(err);
                return "An error occurred running this command! If this persists PLEASE contact us.";
            }
        }
    }
} as ICommand