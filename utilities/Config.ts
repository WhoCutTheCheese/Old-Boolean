import dotENV from "dotenv";
import { Log } from "./Logging";
export const config = require("../config.json");
dotENV.config();

export function validateConfig() {

	if (!config.successEmoji) Log.warn("You are missing the \"successEmoji\" argument in config.json. Some emojis may not work.");
	if (!config.failedEmoji) Log.warn("You are missing the \"failedEmoji\" argument in config.json. Some emojis may not work.");
	if (!config.arrowEmoji) Log.warn("You are missing the \"arrowEmoji\" argument in config.json. Some emojis may not work.");
	if (!config.bulletpointEmoji) Log.warn("You are missing the \"bulletpointEmoji\" argument in config.json. Some emojis may not work.");
	if (!config.devs) Log.warn("You are missing the \"devs\" array argument in config.json. PermissionLevel.Developer will not function.");

	config.token = process.env.TOKEN;
	config.clientID = process.env.CLIENT_ID;
	config.mongoURI = process.env.MONGO_URI;
	config.errorWebhookURL = process.env.ERROR_WEBHOOK_URL;

	if (!config.clientID) Log.error("You are missing the \"CLIENT_ID\" environment variable! Slash commands will not work.");
	if (!config.mongoURI) Log.error("You are missing the \"MONGO_URI\" evironment variable! Make sure you have a .env file with the mongo uri in it.");
	if (!config.token) Log.error("You are missing the \"TOKEN\" evironment variable! Make sure you have a .env file with the token in it.");
	if (!config.errorWebhookURL) Log.error("You are missing the \"ERROR_WEBHOOK_URL\" evironment variable! Make sure you have a .env file with the error webhook url in it.");

	Log.info("Successfully validated configuration files.");
}