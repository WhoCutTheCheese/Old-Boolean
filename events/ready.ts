import { ActivityType, Client } from "discord.js"
import mongoose from "mongoose";
import dotEnv from "dotenv"
import fs from "fs"
import path from "path"
dotEnv.config()

let statuses = ["nothing", "the Aether", "you", "the stars", "space", "your server"]
module.exports = {
    name: "ready",
    once: false,
    async execute(client: Client) {
        console.log("Boolean is coding the future...")
        client.user?.setPresence({
            activities: [{ name: `${statuses[Math.floor(Math.random() * 5)]} | !!help & (/) commands`, type: ActivityType.Watching }],
            status: "dnd"
        })
        await mongoose.connect(`${process.env.mongo_url}`, { keepAlive: true })

        setInterval(global.check, 1000 * 30)

        const baseFile = 'command_base.ts'
        const commandBase = require(`../legacyCommands/command_base`);    
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
    
            
        readCommands('../legacyCommands')
        commandBase.listen(client);
        setInterval(global.check, 1000 * 30)

        console.log("Boolean has started.")

    }
}