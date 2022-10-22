import { Guild, WebhookClient } from "discord.js";
import Settings from "../models/settings";

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild) {

        const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" });
        webhook.send({ content: `<:yes:979193272612298814>  I was added to \`${guild.name}\`, \`${guild.memberCount.toLocaleString()} members\`` })    

        const settings = await Settings.findOne({
            guildID: guild.id
        })
        if(!settings) {
            const newSettings = new Settings({
                guildID: guild.id,
                guildSettings: {
                    prefix: "!",
                }
            })
            newSettings.save().catch((err: Error) => console.log(err))
        }


    }
}