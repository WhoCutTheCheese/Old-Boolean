import { ActivityType, Events } from "discord.js";
import { EventsBuilder } from "../classes/EventBuilder";
import { Log } from "../utilities/Logging";
import { client } from "../Index";
import mongoose from "mongoose";
import { config } from "../utilities/Config";

export default new EventsBuilder()
	.setEvent(Events.ClientReady)
	.setExecutor(async () => {
		Log.info("Boolean is starting!");
		const msNow = Date.now();

		client.user?.setActivity({
			name: "What could this be?",
			type: ActivityType.Custom,
		});

		await mongoose.connect(config.mongoURI);

		Log.info(`Boolean is ready! (${Date.now() - msNow}ms)`);
	});