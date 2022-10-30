import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, EmbedBuilder, Message, PermissionsBitField, TextChannel, time } from "discord.js";
import Settings from "../../models/settings";
import Permits from "../../models/permits";
import Cases from "../../models/cases";
import { PunishTypes } from "../../classes/types/types";
import { Punishment } from "../../classes/punish";

module.exports = {
    commands: ['softban', 'sb'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Delete Days) (Reason)",
    commandName: "BAN",
    commandCategory: "MODERATION",
    cooldown: 2,
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.BanMembers])) return message.channel.send({ content: "I require the `Ban Members` to ban users!" });

        const settings = await Settings.findOne({
            guildID: message.guild?.id
        })
        if (!settings) return message.channel.send({ content: "Sorry, your settings file doesn't exist! If this error persists contact support" })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!member) return message.channel.send({ content: "I was unable to find that member!" })

        const permits = await Permits.find({
            guildID: message.guild?.id
        })

        let ObjectID: any
        for (const permit of permits) {
            if (permit.users.includes(member.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (message.author.id !== message.guild?.ownerId) {
            if (thePermit?.bypassBan == true) return message.channel.send({ content: "You cannot ban this member!" });
        }
        if (member.id === message.author.id) return message.channel.send({ content: "You cannot ban yourself!" })
        if (member.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot ban this user!" })
        if (member.id === client.user?.id) return message.channel.send({ content: "You cannot ban me. My power levels are too high!" })
        if (member) {
            if (message.guild.members.me.roles.highest.position < member.roles.highest.position) return message.channel.send({ content: "This member is above me! I cannot ban them." })
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

        const warns = await Cases.countDocuments({ userID: member.id, caseType: "Warn" })

        if (!isNaN(Number(args[1]))) {

            let reason = "No reason provided."
            if (args[2]) reason = args.slice(2).join(" ");
            if(reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length! (250 Characters)" })

            if (Number(args[1]) > 7) return message.channel.send({ content: "You cannot delete messages past 7 days." })
            if (Number(args[1]) <= 0) return message.channel.send({ content: "You cannot delete messages less than 1 day." })

            new Punishment({ type: PunishTypes.SoftBan, user: member.user, member: member, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns, deleteDays: Number(args[1]) })


            return;

        }

        let reason = "No reason provided."
        if (args[1]) reason = args.slice(1).join(" ");
        if(reason.length > 250) return message.channel.send({ content: "Reason exceeds maximum length! (250 Characters)" })

        new Punishment({ type: PunishTypes.SoftBan, user: member.user, member: member, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns, deleteDays: 7 })

    }
}
