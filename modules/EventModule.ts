import path from "path";
import { ModuleBuilder } from "../classes/ModuleBuilder";
import { client } from "../Index";
import fs from "fs";
import { EventsBuilder } from "../classes/EventBuilder";
import { ClientEvents } from "discord.js";

export default new ModuleBuilder()
	.setName('Event Module')
	.setExecutor(async () => {

		const eventPath = path.join(__dirname, "..", "events");
		const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith(".ts"));
		for (const file of eventFiles) {
			const filePath = path.join(eventPath, file);
			const event = (await import(filePath)).default as EventsBuilder;

			if (event.once()) {
				client.once(event.event(), (...args: ClientEvents[]) => { event.execute(...args); });
			} else {
				client.on(event.event(), (...args: ClientEvents[]) => { event.execute(...args); });
			}
		}
	});