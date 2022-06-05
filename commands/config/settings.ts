import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
const Guild = require("../../models/guild");
const Cases = require("../../models/cases");
module.exports = {
    commands: ['settings', 'config'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[Module]",
    cooldown: 10,
    userPermissions: [ "ADMINISTRATOR", "MANAGE_GUILD" ],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
    },
}