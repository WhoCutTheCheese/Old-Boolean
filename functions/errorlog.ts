import { Client, Message, MessageEmbed, TextChannel, User, Permissions, Guild, WebhookClient } from 'discord.js'
const GuildSchema = require("../models/guild")
const ConfigSchema = require("../models/config")
const Cases = require("../models/cases")
export = async function ErrorLog(errorGuild: Guild, errorCommand: string, error: Error, client: Client, message: Message, errorPersonID: string, commandFile: string) {
    try {
        const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/989997693222936626/OfANduSt0r2UBkJIx6r35NZgLbA9yfhnUrJg4pHGTq8ygkeOsx0ybmQuydonupAdW0Zb' });
        console.error(error);
        const warnEmbed = new MessageEmbed();
        warnEmbed.setAuthor({ name: "An Error Occurred!" })
        warnEmbed.setDescription(`There was an error with the \`${errorCommand}\`\n\n__**Error Details:**__ ${errorCommand}\n> **Guild ID:** [${errorGuild.id}]\n> **User ID:** [${errorPersonID}]\n> **Command File:** [${commandFile}]`)
        warnEmbed.addField("Error", "```diff\n- " + error.message + "\n```")
        warnEmbed.setColor("RED");
        webhookClient.send({ embeds: [warnEmbed], content: `<@493453098199547905>` });
    } catch {
        (err: Error) => {
            console.log(err)
        }
    }
}
