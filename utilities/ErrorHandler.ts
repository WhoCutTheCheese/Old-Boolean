import { EmbedBuilder, Interaction, Message, WebhookClient } from "discord.js";
import { config } from "./Config";
import { Log } from "./Logging";

/**
 * Handle error function
 * @param err An error type
 * @param file The file in which the error occurred
 */
export function handleError(err: Error, file?: string, source?: Message | Interaction) {
	const errorWebhook = new WebhookClient({ url: config.errorWebhookURL });
	if (!errorWebhook) return;

	Log.error(`Boolean encountered an error in ${file || "unknown"}:\n\n${err.stack}`);

	let description = `**__Details:__**`;

	if (file) description += "\n\n**File:** " + file;
	if (source) description += "\n**Guild:** " + source.guild?.name;
	description += `\n**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`;

	const errorEmbed = new EmbedBuilder()
		.setAuthor({ name: "An error occurred!", iconURL: source?.guild?.iconURL() || undefined })
		.setDescription(description)
		.setColor("Blurple")
		.addFields(
			{
				name: "Error", value: `\`\`\`diff
				- ${err.message}\`\`\``
			}
		);
	errorWebhook.send({ embeds: [errorEmbed] });
}