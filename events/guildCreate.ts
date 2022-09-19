import { Guild, WebhookClient } from "discord.js";
import GuildProperties from "../models/guild";
import Configuration from "../models/config";
import AConfig from "../models/automodConfig";
module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild) {

        const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" });
        webhook.send({ content: `<:yes:979193272612298814>  I was added to \`${guild.name}\`, \`${guild.memberCount.toLocaleString()} members\`` })    

        const guildProp = await GuildProperties.findOne({
            guildID: guild.id,
        })
        const automodConfig = await AConfig.findOne({
            guildID: guild.id
        })
        if(!guildProp) {
            const newGuildProp = new GuildProperties({
                guildID: guild.id,
                premium: false,
                premiumHolder: "None",
                totalCases: 0,
            })
            newGuildProp.save().catch((err: Error) => {console.log(err)});
        }

        const configuration = await Configuration.findOne({
            guildID: guild.id
        })
        if(!configuration) {
            const newConfiguration = new Configuration({
                guildID: guild.id,
                muteRoleID: "None",
                modLogChannel: "None",
                joinRoleID: "None",
                embedColor: "5865F2",
                dmOnPunish: true,
                modRoleID: [],
                adminRoleID: [],
                warnsBeforeMute: 3,
            })
            newConfiguration.save().catch((err: Error) => {console.log(err)})
        }

        if(!automodConfig) {
            const newAutomod = new AConfig({
                guildID: guild.id,
                blockLinks: false,
                blockScams: false,
                massMentions: false,
                maxMentions: 3,
                websiteWhitelist: ["https://cdn.discordapp.com", "https://discord.com", "https://tenor.com", "https://media.discordapp.net"],
            })
            newAutomod.save()
        }
        
    }
}