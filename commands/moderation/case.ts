import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction, Interaction } from "discord.js";
const Guild = require("../../models/guild");
const Cases = require("../../models/cases");
module.exports = {
    commands: ['case', 'findcase', 'lookup'],
    minArgs: 1,
    expectedArgs: "[Case Number]",
    cooldown: 1,
    userPermissions: ["MANAGE_MESSAGES"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {

        
    },
}