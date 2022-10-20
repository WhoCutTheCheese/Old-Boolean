import { Guild, WebhookClient } from "discord.js";
import GuildProperties from "../models/guild";
import Configuration from "../models/config";

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild) {

        const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" });
        webhook.send({ content: `<:yes:979193272612298814>  I was added to \`${guild.name}\`, \`${guild.memberCount.toLocaleString()} members\`` })    

        const guildProp = await GuildProperties.findOne({
            guildID: guild.id,
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
                prefix: "!!",
                muteRoleID: "None",
                modLogChannel: "None",
                joinRoleID: "None",
                embedColor: "5865F2",
                dmOnPunish: true,
                modRoleID: [],
                adminRoleID: [],
                warnsBeforeMute: 3,
                deleteCommandUsage: false,
            })
            newConfiguration.save().catch((err: Error) => {console.log(err)})
        }


    }
}