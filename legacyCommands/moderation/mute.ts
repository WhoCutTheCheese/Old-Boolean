import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, Message, PermissionsBitField } from "discord.js";
import { Punishment, PunishTypes } from "../../classes/punish";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";
const ms = require("ms");

module.exports = {
    commands: ["mute", "silence", "m"],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Length) (Reason)",
    commandName: "MUTE",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.ManageRoles])) return message.channel.send({ content: "I require the `Timeout Members` and `Manage Roles` to issue mutes!" });

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

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot mute yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot mute this user!" })
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
            if (thePermit?.bypassMute == true) return message.channel.send({ content: "You cannot mute this user!" });
        }
        if (message.guild.members.me.roles.highest.position < user.roles.highest.position) return message.channel.send({ content: "This user is above me! I cannot mute them." })

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

        //temp mute

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

                    if (ms(`${time}${type1}`) >= 2332800) return message.channel.send({ content: "Length exceed maximum time." })

                    new Punishment({ type: PunishTypes.Mute, time: time + type1, timeFormatted: time + " " + type, user: user.user, member: user, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns })
                    return;
                }
            }
        }

        //perma mute
        if (!settings.modSettings?.muteRole) return message.channel.send({ content: "There is no mute role!" })
        let reason = args.splice(1).join(" ")
        if (!reason) reason = "No reason provided."
        if (reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum lenth. (250 Characters)" })
        if(!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.channel.send({ content: "I cannot assign roles!" })
        if(message.guild.roles.cache.get(settings.modSettings.muteRole)?.position! > message.guild.members.me.roles.highest.position) return message.channel.send({ content: "I cannot assign the mute role, it is above me!" })
        console.log("awd")
        new Punishment({ type: PunishTypes.Mute, user: user.user, member: user, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns })
        console.log("awd2")
    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}