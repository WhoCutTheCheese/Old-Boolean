import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, InteractionCollector, Message, PermissionsBitField, TextChannel } from "discord.js";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
import { Punishment, PunishTypes } from "../../classes/punish";
const ms = require("ms");

module.exports = {
    commands: ["warn", "w"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    commandName: "WARN",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;
        
        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        const user = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send({ content: "Invalid User!" })

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot issue warnings to yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot issue warnings to this user!" })
        if (user.id === client.user?.id) return message.channel.send({ content: "You cannot warn me. My power levels are too high!" })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if(message.author.id !== message.guild?.ownerId) {
            if (thePermit?.bypassWarn == true) return message.channel.send({ content: "You cannot warn this user!" });
        }
        let caseNumberSet: number = 10010100101
        if (!settings.guildSettings?.totalCases) {
            caseNumberSet = 1;
        } else if (settings.guildSettings?.totalCases) {
            caseNumberSet = settings.guildSettings?.totalCases + 1;
        }
        await Settings.findOneAndUpdate({
            guildID: message.guild?.id,
        }, {
            guildSettings: {
                totalCases: caseNumberSet
            }
        })

        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })
        let remainder = 1;
        let warnsBeforeMute = 3
        if (settings.modSettings?.warnsBeforeMute) warnsBeforeMute = settings.modSettings?.warnsBeforeMute
        if (warns != 0) {
            if (warnsBeforeMute === 0) {
                remainder = 1
            } else {
                remainder = warns % warnsBeforeMute!;
            }
        }
        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason provided!"
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length. (250 Characters)" })


        new Punishment({ type: PunishTypes.Warn, user: user.user, member: user, reason: reason, caseNumberSet: caseNumberSet, message: message, warns: warns, remainder: remainder, settings: settings, color: color })


    }
}