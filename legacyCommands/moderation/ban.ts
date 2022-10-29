import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, Message, PermissionsBitField } from "discord.js";
import { Punishment, PunishTypes } from "../../classes/punish";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
const ms = require("ms");

module.exports = {
    commands: ["ban", "thanosnap", "b", "bean"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Length) (Reason)",
    commandName: "BAN",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.BanMembers])) return message.channel.send({ content: "I require the `Ban Members` to ban users!" });

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

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        let meow
        let user = await client.users.fetch(args[0]).catch((err: Error) => {     
            meow = false
        }) || message.mentions.users.first();
        if (meow == false) {
            if(!member) {
                return message.channel.send({ content: "Invalid user!" })
            }
            user = member.user
        };

        if(!user) return message.channel.send({ content: "Invalid user!" })


        if (user.id === message.author.id) return message.channel.send({ content: "You cannot ban yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot ban this user!" })
        if (user.id === client.user?.id) return message.channel.send({ content: "You cannot ban me. My power levels are too high!" })

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
            if (thePermit?.bypassBan == true) return message.channel.send({ content: "You cannot ban this user!" });
        }
        if (member) {
            if (message.guild.members.me.roles.highest.position <= member.roles.highest.position) return message.channel.send({ content: "This user is above me! I cannot ban them." })
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

        //temp ban

        if (/^\d/.test(args[1])) {
            if (endsWithAny(["s", "m", "h", "d", "w"], args[1])) {

                const time = args[1].replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "")
                if (!isNaN(Number(time))) {

                    let reason = args.splice(2).join(" ")
                    if (!reason) reason = "No reason provided."
                    if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length. (250 Characters)" })

                    let type1: any
                    if (args[1].endsWith("s")) {
                        type1 = "s"
                    } else if (args[1].endsWith("m")) {
                        type1 = "m"
                    } else if (args[1].endsWith("h")) {
                        type1 = "h"
                    } else if (args[1].endsWith("d")) {
                        type1 = "d"
                    } else if (args[1].endsWith("w")) {
                        type1 = "w"
                    }
                    let type: any
                    if (args[1].endsWith("s")) {
                        type = "second(s)"
                    } else if (args[1].endsWith("m")) {
                        type = "minute(s)"
                    } else if (args[1].endsWith("h")) {
                        type = "hour(s)"
                    } else if (args[1].endsWith("d")) {
                        type = "day(s)"
                    } else if (args[1].endsWith("w")) {
                        type = "week(s)"
                    }

                    let length: number;
                    if (type === "second(s)") {
                        length = parseInt(time);
                    } else if (type === "minute(s)") {
                        length = parseInt(time) * 60
                    } else if (type === "hour(s)") {
                        length = parseInt(time) * 60 * 60
                    } else if (type === "day(s)") {
                        length = parseInt(time) * 60 * 60 * 24
                    } else if (type === "week(s)") {
                        length = parseInt(time) * 60 * 60 * 24 * 7
                    }

                    const expires = new Date()

                    expires.setSeconds(expires.getSeconds() + length!)

                    new Punishment({ type: PunishTypes.Ban, time: expires, timeFormatted: time + " " + type, user: user, member: member!, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns })
                    
                    return;
                }
            }
        }

        //perma ban
        let reason = args.splice(1).join(" ")
        if (!reason) reason = "No reason provided."
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum lenth. (250 Characters)" })

        new Punishment({ type: PunishTypes.Ban, user: user, member: member!, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns })

    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}