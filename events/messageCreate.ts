import { Client, Message } from "discord.js";
import GuildProperties from "../models/guild";
import Configuration from "../models/config";
import performAutomod from "../functions/performAutomod";

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message: Message, client: Client) {
        performAutomod(message, client);
        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id
        })
        if(!guildProp) {
            const newGuildProperties = new GuildProperties({
                guildID: message.guild?.id,
                premium: false,
                premiumHolder: "None",
                totalCases: 0,
            })
            newGuildProperties.save().catch((err: Error) => {console.log(err)})
        }

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id,
        })

        if(!configuration) {
            const newConfiguration = new Configuration({
                guildID: message.guild?.id,
                prefix: "!!",
                muteRoleID: "None",
                modLogChannel: "None",
                joinRoleID: "None",
                embedColor: "5865F2",
                dmOnPunish: false,
                modRoleID: [],
                adminRoleID: [],
                warnsBeforeMute: 3,
                deleteCommandUsage: false,
            })
            newConfiguration.save().catch((err: Error) => {console.log(err)})
        }

    }
}