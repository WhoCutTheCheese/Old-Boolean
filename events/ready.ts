import { ActivityType, Client } from "discord.js"
import mongoose from "mongoose";
import dotEnv from "dotenv"
dotEnv.config()

let statuses = ["C-can you hear that music?", "Stardust to stardust", "NO ONE ESCAPES GRAVITY!", "What was that equation?",
"The Aether", "IT'S JUST SO SIMPLE", "Like Newton and apple", "An elementary application",
"The universe has no obligation to make sense to you!", "Wholly predictable!", "The universe sings to me", "Het universum zingt voor mij",
"Ooh this one has teeth.. Rawr :3", "Listen to your mommy", "And they say chivalry is dead", "Hot coco? Fineee",
"Ah like a spherical cow!", "The universe flows through me!"]
module.exports = {
    name: "ready",
    once: false,
    async execute(client: Client) {
        console.log("Boolean is coding the future...")
        client.user?.setPresence({
            activities: [{ name: `${statuses[randomIntFromInterval(0, statuses.length)]} | /`, type: ActivityType.Watching }],
            status: "dnd"
        })
        await mongoose.connect(`mongodb+srv://SmartSky:CheeseCake101@booleanstorage.3ud4r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { keepAlive: true })

        setInterval(global.check, 1000 * 30)

        console.log("Boolean has started.")

    }
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}