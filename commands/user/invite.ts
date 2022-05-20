import { MessageEmbed, MessageActionRow, MessageButton, Client, Message } from 'discord.js'
const Guild = require("../../models/guild");
module.exports = {
    commands: ['invite', 'add'],
    minArgs: 0,
    maxArgs: 0,
    cooldown: 1,
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        const guildSettings = await Guild.findOne({
            guildID: message.guild?.id,
        })
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel("Invite")
                .setEmoji("🔗")
                .setStyle("LINK")
                .setURL("https://discord.com/api/oauth2/authorize?client_id=966634522106036265&permissions=1392307989702&scope=bot%20applications.commands"),
            new MessageButton()
                .setLabel("Support Server")
                .setEmoji("🔗")
                .setStyle("LINK")
                .setURL("https://discord.gg/VD4sf98hKd"),
            new MessageButton()
                .setLabel("Vote")
                .setEmoji("🔗")
                .setStyle("LINK")
                .setURL("https://google.com"),

        )

        const invite = new MessageEmbed()
            .setTitle("Invite Me!")
            .setColor(guildSettings.color)
            .setDescription("Boolean is an easy-to-use and in-depth moderation bot with all the features you need to keep your user in check!")
        message.channel.send({ embeds: [invite], components: [row] })
    },
}