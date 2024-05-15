import path from "path";
import fs from "fs";
import { ModuleBuilder } from "../classes/ModuleBuilder";
import { handleError } from "./ErrorHandler";
import { Log } from "./Logging";

export async function initModules() {
	const modulePath = path.join(__dirname, "..", "modules");
	const moduleFiles = fs.readdirSync(modulePath);

	for (const file of moduleFiles) {
		const module = (await import(path.join(modulePath, file))).default as ModuleBuilder;

		module.execute()
			.catch((err: Error) => handleError(err, module.name()));
		Log.info(`${module.name()} has been initialized.`);
	}
}