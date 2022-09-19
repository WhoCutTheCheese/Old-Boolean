import { Guild, WebhookClient } from "discord.js";
import GuildProperties from "../models/guild";
import UserTokens from "../models/tokens";
import Configuration from "../models/config";
import AConfig from "../models/automodConfig";
module.exports = {
    name: "guildDelete",
    once: false,
    async execute(guild: Guild) {

        const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" });
        webhook.send({ content: `<:no:979193272784265217>  I was removed from \`${guild.name}\`, \`${guild.memberCount.toLocaleString()} members\`` })    

        const guildProp = await GuildProperties.findOne({
            guildID: guild.id,
        })
        if (guildProp) {
            if (await GuildProperties.countDocuments({ guildID: guild.id }) > 1) {
                GuildProperties.deleteMany({
                    guildID: guild.id,
                })
            } else {
                if (guildProp.premiumHolder != "None") {
                    const fetchTokens = await UserTokens.findOne({
                        userID: guildProp.premiumHolder,
                    })
                    if(!fetchTokens) return;
                    await UserTokens.findOneAndUpdate({
                        userID: guildProp.premiumHolder,
                    }, {
                        tokens: fetchTokens.tokens! + 1,
                    })
                }
                await GuildProperties.findOneAndDelete({
                    guildID: guild.id
                })
            }
        }

        const configuration = await Configuration.findOne({
            guildID: guild.id
        })
        if (configuration) {
            if (await Configuration.countDocuments({ guildID: guild.id }) > 1) {
                Configuration.deleteMany({
                    guildID: guild.id,
                })
            } else {
                Configuration.findOneAndDelete({
                    guildID: guild.id
                })
            }
        }
        await AConfig.findOneAndDelete({
            guildID: guild.id
        })

    }
}
