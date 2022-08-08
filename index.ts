import { Client, ClientVoiceManager, Guild, Intents, Message, MessageEmbed, User, WebhookClient } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from "path";
import mongoose from "mongoose";
import Tokens from './models/tokens';
import GuildSchema from "./models/guild";
import ConfigSchema from "./models/config";
import Bans from "./models/ban";
import WOKcommands from "wokcommands";
dotenv.config();
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});
let statuses = [ "C-can you hear that music?", "Stardust to stardust", "NO ONE ESCAPES GRAVITY!", "What was that equation?", "The Aether", "IT'S JUST SO SIMPLE", "Like Newton and apple", "An elementary application", "The universe has no obligation to make sense to you!", "Wholly predictable!", "The universe sings to me", "Het universum zingt voor mij", "Ooh this one has teeth.. Rawr :3", "Listen to your mommy", "And they say chivalry is dead", "Hot coco? Fineee" ]
client.on('ready', async () => {
    console.log("Boolean is coding the future")
    client.user?.setStatus('dnd')
    client.user?.setActivity(`${statuses[randomIntFromInterval(1,statuses.length)]} | !!help`, {
        type: "WATCHING",
    });

    new WOKcommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
        dbOptions: {
            keepAlive: true
        },
        mongoUri: process.env.mongo_url,
        botOwners: ["493453098199547905", "648598769449041946"],
    })
        .setDefaultPrefix("!!")

    setInterval(check, 1000 * 60);
    console.log("Boolean has started!")
});
import Config from "./models/config";
client.on('guildMemberAdd', async member => {
    const nonGuildMember = client.users.cache.get(member.id)
    if (nonGuildMember?.bot) { return; }
    const configSettings = await Config.findOne({
        guildID: member.guild.id,
    })
    if (configSettings.joinRoleID === "None") { return; }
    member.roles.add(configSettings.joinRoleID)
})
client.on("guildCreate", async (guild: Guild) => {
    const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" })
    const embed = new MessageEmbed()
        .setAuthor({ name: "Server Added", iconURL: guild.iconURL({ dynamic: true }) || "" })
        .setColor("GREEN")
        .setDescription(`**__Server Information__**
        > **Name:** ${guild.name}
        > **ID:** ${guild.id}
        > **Members:** ${guild.memberCount.toLocaleString}
        
        > **Servers:** ${client.guilds.cache.size.toLocaleString()}
        > **Added:** <t:${Math.round(Date.now() / 1000)}:D> (<t:${Math.round(Date.now() / 1000)}:R>)`)
        .setThumbnail(guild.iconURL({ dynamic: true }) || "")
    webhook.send({ embeds: [embed] })
    ConfigSchema.findOne({
        guildID: guild?.id,
    }, (err: any, config: any) => {
        if (err) console.error(err)
        if (!config) {
            const newConfig = new ConfigSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: guild?.id,
                muteRoleID: "None",
                modLogChannel: "None",
                joinRoleID: "None",
                embedColor: "5865F2",
                dmOnPunish: true,
                modRoleID: [],
                adminRoleID: [],
                warnsBeforeMute: 3,

            });
            newConfig.save()
                .catch((err: any) => console.error(err))
        };
    });
    const guildShit = await GuildSchema.findOne({
        guildID: guild.id
    })
    if(!guildShit) {
        const newGuild = new GuildSchema({
            guildID: guild.id,
            premium: false,
            premiumHolder: "None",
            totalCases: 0,
        })
        newGuild.save()
    }
})
client.on('guildDelete', async guild => {
    const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1004515583469043722/8PZOWpUWZ22i-sqL3zaFLIdtjFa_LAW6PazXCa8JlOy2fPa2CkNeuT9VIKrMllwUG3fO" })
    const embed = new MessageEmbed()
        .setAuthor({ name: "Server Removed", iconURL: guild.iconURL({ dynamic: true }) || "" })
        .setColor("RED")
        .setDescription(`**__Server Information__**
        > **Name:** ${guild.name}
        > **ID:** ${guild.id}
        > **Members:** ${guild.memberCount.toLocaleString()}
        
        > **Servers:** ${client.guilds.cache.size.toLocaleString()}
        > **Removed:** <t:${Math.round(Date.now() / 1000)}:D> (<t:${Math.round(Date.now() / 1000)}:R>)`)
        .setThumbnail(guild.iconURL({ dynamic: true }) || "")
    webhook.send({ embeds: [embed] })
    const guildS = await GuildSchema.findOne({
        guildID: guild.id,
    });
    if(!guildS) { return; }
    if (guildS.premium == true) {
        const token = await Tokens.findOne({
            userID: guildS.premiumHolder
        })
        await Tokens.findOneAndUpdate({
            userID: guildS.premiumHolder
        }, {
            tokens: token.tokens + 1
        })
        setTimeout(async function () {
            await GuildSchema.findOneAndRemove({
                guildID: guild.id
            })
        }, 1000);
    } else if (guildS.premium == false) {
        await GuildSchema.findOneAndRemove({
            guildID: guild.id
        });
    };
    await ConfigSchema.findOneAndRemove({
        guildID: guild.id,
    })
});
import performAutomod from "./functions/performAutomod";
client.on("messageCreate", async message => {
    performAutomod(message, client);
    const configuration = await ConfigSchema.findOne({
        guildID: message.guild?.id
    })

    if(!configuration) {
        const newConfig = new ConfigSchema({
            guildID: message.guild?.id,
            muteRoleID: "None",
            modLogChannel: "None",
            joinRoleID: "None",
            embedColor: "5865F2",
            dmOnPunish: true,
            modRoleID: [],
            adminRoleID: [],
            warnsBeforeMute: 3,
        })
        newConfig.save()
    }

    GuildSchema.findOne({
        guildID: message.guild?.id
    }, ((err: any, guild: any) => {
        if (err) console.error(err)
        if (!guild) {
            const newGuild = new GuildSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: message.guild?.id,
                premium: false,
                premiumHolder: "None",
                totalCases: 0,
            })
            newGuild.save()
                .catch((err: Error) => console.error(err))
            return;
        }
    }));
})
const check = async () => {
    const results = await Bans.find({
        caseEndDate: { $lt: new Date() },
    })
    if (!results) { return; }
    for (const result of results) {
        const { guildID, userID } = result
        const guild = await client.guilds.fetch(guildID);
        await Bans.deleteMany({
            caseEndDate: { $lt: new Date() },
        })
        guild.members.unban(userID).catch((err: Error) => console.error(err))

    }


}
function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
check()
client.login(process.env.token);
//client.login(process.env.beta_token);
