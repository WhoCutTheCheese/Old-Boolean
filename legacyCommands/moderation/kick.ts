import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ColorResolvable, Message, PermissionsBitField } from "discord.js";
import { Punishment } from "../../classes/punish";
import { PunishTypes } from "../../classes/types/types";
import Settings from "../../models/settings";
import Cases from "../../models/cases";
import Permits from "../../models/permits";

module.exports = {
    commands: ['kick', 'k'],
    minArgs: 1,
    expectedArgs: "[@User/User ID] (Reason)",
    commandName: "KICK",
    commandCategory: "MODERATION",
    callback: async (client: Client, message: Message, args: string[]) => {

        if (!message.guild?.members.me?.permissions.has([PermissionsBitField.Flags.KickMembers])) return message.channel.send({ content: "I require the `Kick Members` to issue kicks!" });

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

        if (user.id === message.author.id) return message.channel.send({ content: "You cannot kick yourself!" })
        if (user.id === message.guild?.ownerId) return message.channel.send({ content: "You cannot kick this user!" })
        if (user.id === client.user?.id) return message.channel.send({ content: "You cannot kick me. My power levels are too high!" })

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
            if (thePermit?.bypassKick == true) return message.channel.send({ content: "You cannot kick this user!" });
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

        let reason = args.splice(1).join(" ");
        if (!reason) reason = "No reason provided."
        if (reason.length > 200) return message.channel.send({ content: "Reason exceeds maximum length. (250 Characters)" })

        new Punishment({ type: PunishTypes.Kick, user: user.user, member: user, message: message, settings: settings, color: color, caseNumberSet: caseNumberSet, reason: reason, warns: warns })


    },
}