import { Client, Collection, GatewayIntentBits, PermissionsBitField, Routes, UserResolvable } from "discord.js";
import dotEnv from "dotenv";
import path from "path";
import fs from "fs";
import Bans from "./models/bans";
import { REST } from "@discordjs/rest"
import Settings from "./models/settings"
dotEnv.config()
const token = process.env.token;
const client = new Client({
    intents: [
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ]
})
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
        commandArray: [],
    }
}
client.commands = new Collection();
client.commandArray = [];

declare global {
    var check: any
}
global.check = async () => {
    const results = await Bans.find({
        caseEndDate: { $lt: new Date() },
    })
    if (!results) { return; }
    for (const result of results) {
        const { guildID, userID } = result
        const guild = await client.guilds.fetch(guildID as any);
        await Bans.deleteMany({
            caseEndDate: { $lt: new Date() },
        })
        if(!guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        if(!guild.bans.cache.get(userID as any)) return;
        guild.members.unban(userID as UserResolvable).catch((err: Error) => console.error(err))

    }
}
const eventPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.ts'));
for (const file of eventFiles) {
    const filePath = path.join(eventPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
const commandPath = path.join(__dirname, "slashCommands");
const commandFolders = fs.readdirSync("./slashCommands");
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith(".ts"));

    for (const files of commandFiles) {
        const command = require(`${commandPath}/${folder}/${files}`)

        client.commands.set(command.data.name, command)
        client.commandArray.push(command.data.toJSON() as never)
    }
}

client.on("guildMemberAdd", async member => {
    const nonGuildMember = client.users.cache.get(member.id)
    if (nonGuildMember?.bot) { return; }
    const settings = await Settings.findOne({
        guildID: member.guild.id,
    })
    if(!settings) return;
    if(!settings.guildSettings?.joinRole) return;
    if(!member.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) { return; }
    const role = member.guild.roles.cache.get(settings.guildSettings.joinRole)
    if(role?.position! > member.guild.members.me.roles.highest.position) return
    member.roles.add(settings.guildSettings.joinRole).catch((err: Error) => console.log(err))
})

let clientId
if (token == process.env.beta_token) {
    clientId = "996609716748832768"
} else if (token == process.env.token) {
    clientId = "966634522106036265"
}

const rest = new REST({ version: '10' }).setToken(`${token}`);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId as string),
            { body: client.commandArray },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
import Maintenance from "./models/maintenance";
const devs = ["493453098199547905", "648598769449041946", "585731185083285504"]
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const maintenance = await Maintenance.findOne({
        botID: client.user?.id
    })
    if(maintenance) {
        if(maintenance.maintenance == true) {
            if(!devs.includes(interaction.user.id)) {
                interaction.reply({ content: `**Uh Oh!** Boolean is currently under maintenance!\n**__Details:__** ${maintenance.maintainDetails}`, ephemeral: true })
                return;
            }
        }
    }
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        if(!interaction.guild?.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) return;
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

client.login(token)