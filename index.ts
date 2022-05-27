import { Client, Intents, Message } from 'discord.js';
import Dotenv from 'dotenv';
import fs from 'fs';
import path from "path";
import mongoose from "mongoose";
const Tokens = require('./models/tokens');
const GuildSchema = require("./models/guild");
const ConfigSchema = require('./models/config');
Dotenv.config()

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
    const baseFile = 'command_base.ts'
    const commandBase = require(`./commands/${baseFile}`)

    const readCommands = (dir: string) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file))
            } else if (file !== baseFile) {
                const option = require(path.join(__dirname, dir, file))
                commandBase(option)
            }
        }
    }

    readCommands('commands')
    commandBase.listen(client);
    await mongoose.connect(`${process.env.mongoose}`, { keepAlive: true })
    console.log("Boolean has started!")
});

client.on('guildCreate', async guild => {
    const serverSettings = await GuildSchema.findOne({
        guildID: guild.id
    }, ((err: any, guild: any) => {
        if (err) console.error(err)
        if (!guild) {
            const newGuild = new GuildSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: guild.id,
                prefix: "!!",
                color: `5865F2`,
                premium: false,
                premiumHolder: "None",
                totalCases: 0,
            })
            newGuild.save()
                .catch((err: any) => console.error(err))
        }
    }));
    const config = ConfigSchema.findOne({
        guildID: guild.id,
    }, (err: any, config: any) => {
        if (err) console.error(err)
        if (!config) {
            const newConfig = new ConfigSchema({
                _id: new mongoose.Types.ObjectId(),
                guildID: guild.id,
                muteRoleID: "None",
                modLogChannel: "None",
                joinRoleID: "None",
                modRoleID: [],
                adminRoleID: [],
            });
            newConfig.save()
                .catch((err: any) => console.error(err))
        };
    });
});
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
client.login(process.env.token);