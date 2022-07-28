import { Client, Intents, Message, User } from 'discord.js';
import Dotenv from 'dotenv';
import fs from 'fs';
import path from "path";
import mongoose from "mongoose";
import Tokens from './models/tokens';
import GuildSchema from "./models/guild";
import ConfigSchema from "./models/config";
import Bans from "./models/ban";
import WOKcommands from "wokcommands";
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
client.on('ready', async () => {
    console.log("Boolean is coding the future")
    client.user?.setStatus('dnd')
    client.user?.setActivity('The Aether | !!help', {
        type: "WATCHING",
    });

    new WOKcommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
        dbOptions: {
            keepAlive: true
        },
        mongoUri: "mongodb+srv://SmartSky:CheeseCake101@booleanstorage.3ud4r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        botOwners: ["493453098199547905", "648598769449041946"],
      })
      .setDefaultPrefix("!!")
    
    setInterval(check, 1000 * 60);
    console.log("Boolean has started!")
});
import Config from "./models/config";
client.on('guildMemberAdd', async member => {
    const nonGuildMember = client.users.cache.get(member.id)
    if(nonGuildMember?.bot) { return; }
    const configSettings = await Config.findOne({
        guildID: member.guild.id,
    })
    if(configSettings.joinRoleID === "None") { return; }
    member.roles.add(configSettings.joinRoleID)
})
client.on("guildCreate", async guild => {
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
    GuildSchema.findOne({
        guildID: guild?.id
    }, ((err: any, guild: any) => {
        if (err) console.error(err)
        if (!guild) {
            const newGuild = new GuildSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: guild?.id,
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
client.on('guildDelete', async guild => {
    const guildS = await GuildSchema.findOne({
        guildID: guild.id,
    });
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
client.on("messageCreate", async message => {
    ConfigSchema.findOne({
        guildID: message.guild?.id,
    }, (err: any, config: any) => {
        if (err) console.error(err)
        if (!config) {
            const newConfig = new ConfigSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: message.guild?.id,
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
    if(!results) { return; }
    for (const result of results) {
        const { guildID, userID } = result
        const guild = await client.guilds.fetch(guildID);
        await Bans.deleteMany({
            caseEndDate: { $lt: new Date() },
        })
        guild.members.unban(userID).catch((err: Error) => console.error(err))

    }


}
check()
client.login(process.env.token);
