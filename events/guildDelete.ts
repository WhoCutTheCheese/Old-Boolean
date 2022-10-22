import { Guild, WebhookClient } from "discord.js";
import UserTokens from "../models/tokens";
import Settings from "../models/settings";
import Cases from "../models/cases";
import Permits from "../models/permits";
module.exports = {
    name: "guildDelete",
    once: false,
    async execute(guild: Guild) {

        const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" });
        webhook.send({ content: `<:no:979193272784265217>  I was removed from \`${guild.name}\`, \`${guild.memberCount.toLocaleString()} members\`` })    

        const settings = await Settings.findOne({
            guildID: guild.id
        })
        if(settings?.guildSettings?.premium == true) {
            const userTokens = await UserTokens.findOne({
                userID: settings?.guildSettings?.premiumHolder
            })
            if(!userTokens) return;
            if(!settings.guildSettings.premium || !settings.guildSettings.premiumHolder) return;
            await UserTokens.findOneAndUpdate({
                userID: settings?.guildSettings?.premiumHolder
            }, {
                $inc: { premiumGuilds: 1 }
            })
        }
            
        await Settings.deleteMany({
            guildID: guild.id
        })
        await Cases.deleteMany({
            guildID: guild.id
        })
        await Permits.deleteMany({
            guildID: guild.id
        })

    }
}
