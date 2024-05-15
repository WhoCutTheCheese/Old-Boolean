import { Client, GatewayIntentBits } from "discord.js";
import { config, validateConfig } from "./utilities/Config";
import { handleError } from "./utilities/ErrorHandler";
import { Log } from "./utilities/Logging";
import mongoose from "mongoose";
import { initModules } from "./utilities/InitModules";

export const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
	]
});

// Validation & initialization of Boolean
validateConfig();
initModules();
client.login(config.token);

process.on('unhandledRejection', async (err: Error) => handleError(err, "Index.ts"));
process.on('uncaughtException', async (err: Error) => handleError(err, "Index.ts"));
client.on("error", async (err: Error) => handleError(err, "Index.ts"));
mongoose.connection.on("error", async (err: Error) => { handleError(err, "Index.ts"); process.exit(500); });
mongoose.connection.on("connected", async () => { Log.info("Mongoose has connected successfully."); });