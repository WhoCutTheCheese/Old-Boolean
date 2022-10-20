import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import fs from "fs";
import path from "path";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
const bot = require("../../package.json");

module.exports = {
    commands: ['help', 'cmd', 'cmds', 'commands', 'omgpleasehelpmeimgoingtoexplode'],
    callback: async (client: Client, message: Message, args: string[]) => {

        const configuration = await Configuration.findOne({
            guildID: message.guild?.id
        })
        const color = configuration?.embedColor as ColorResolvable;

        const guildProp = await GuildProperties.findOne({
            guildID: message.guild?.id
        })

        let user: string[] = []
        const userPath = path.join(__dirname, "..", "..", "legacyCommands", "user");
        const userFiles = fs.readdirSync(`${userPath}`).filter(file => file.endsWith(".ts"));
        for (const file of userFiles) {
            user.push(` \`${file.replace(".ts", "")}\``)

        }

        let mod: string[] = []
        const modPath = path.join(__dirname, "..", "..", "legacyCommands", "moderation");
        const modFiles = fs.readdirSync(`${modPath}`).filter(file => file.endsWith(".ts"));
        for (const file of modFiles) {
            mod.push(` \`${file.replace(".ts", "")}\``)

        }

        let conf: string[] = []
        const confPath = path.join(__dirname, "..", "..", "legacyCommands", "configuration");
        const confFiles = fs.readdirSync(`${confPath}`).filter(file => file.endsWith(".ts"));
        for (const file of confFiles) {
            conf.push(` \`${file.replace(".ts", "")}\``)

        }

        switch (args[0]) {
            case "ban":
                const ban = new EmbedBuilder()
                    .setTitle("Ban Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`ban\`, \`b\`, \`thanosnap\`, \`bean\`
                    **Usage:** \`!!ban [@User/User ID] (Length) (Reason)\`
                    **Examples:** 
                    \`!!ban @User You were a bad person!\`
                    \`!!ban 123456789012345678 1d You were a bad person!\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [ban] })
                break;
            case "case":
                const caseEmbed = new EmbedBuilder()
                    .setTitle("Case Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`case\`, \`viewcase\`\
                    **Usage:** \`!!case [Case Number]\`
                    **Examples:** 
                    \`!!case 10\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [caseEmbed] })
                break;
            case "delcase":
                const delCaseEmbed = new EmbedBuilder()
                    .setTitle("Delete Case Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`delcase\`, \`dc\`\
                    **Usage:** \`!!delcase [Case Number]\`
                    **Examples:** 
                    \`!!delcase 10\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [delCaseEmbed] })
                break;
            case "history":
                const historyEmbed = new EmbedBuilder()
                    .setTitle("Punishment History Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`history\`, \`h\`, \`warns\`, \`infractions\`
                    **Usage:** \`!!history [@User/User ID]\`
                    **Examples:** 
                    \`!!history @User\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [historyEmbed] })
                break;
            case "kick":
                const kickEmbed = new EmbedBuilder()
                    .setTitle("Kick Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`kick\`, \`k\`
                    **Usage:** \`!!kick [@User/User ID] (Reason)\`
                    **Examples:** 
                    \`!!kick @User Meanie pants!\`
                    \`!!kick 123456789012345678 Meanie pants!\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [kickEmbed] })
                break;
            case "lock":
                const lockEmbed = new EmbedBuilder()
                    .setTitle("Channel Lock Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`lock\`, \`l\`
                    **Usage:** \`!!lock (#Channel/Channel ID)\`
                    **Examples:** 
                    \`!!lock\`
                    \`!!lock #Channel\`
                    \`!!lock 123456789012345678\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [lockEmbed] })
                break;
            case "mute":
                const muteEmbed = new EmbedBuilder()
                    .setTitle("Mute Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`mute\`, \`m\`, \`silence\`
                    **Usage:** \`!!mute [@User/User ID] (Length) (Reason)\`
                    **Examples:** 
                    \`!!mute @User You said a bad word!\`
                    \`!!mute 123456789012345678 1d You said a bad word!\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [muteEmbed] })
                break;
            case "nickname":
                const nicknameEmbed = new EmbedBuilder()
                    .setTitle("Nickname Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`nickname\`, \`nick\`
                    **Usage:** \`!!nick [@User/User ID] [New Nickname/reset]\`
                    **Examples:** 
                    \`!!nickname @User New Nickname\`
                    \`!!nickname 123456789012345678 reset\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [nicknameEmbed] })
                break;
            case "purge":
                const purgeEmbed = new EmbedBuilder()
                    .setTitle("Purge Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`purge\`, \`clear\`, \`p\`
                    **Usage:** \`!!purge [Limit]\` Max of 100
                    **Examples:** 
                    \`!!purge 10\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [purgeEmbed] })
                break;
            case "reason":
                const reasonEmbed = new EmbedBuilder()
                    .setTitle("Case Reason Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`reason\`, \`r\`, \`casereason\`
                    **Usage:** \`!!reason [Case Number] [New Reason]\`
                    **Examples:** 
                    \`!!reason 10 This is a new reason!\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [reasonEmbed] })
                break;
            case "unban":
                const unbanEmbed = new EmbedBuilder()
                    .setTitle("Unban Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`unban\`, \`ub\`
                    **Usage:** \`!!unban [User ID]\`
                    **Examples:** 
                    \`!!unban 12345678912345678\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [unbanEmbed] })
                break;
            case "unlock":
                const unlockembed = new EmbedBuilder()
                    .setTitle("Channel Unlock Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`unlock\`, \`ul\`
                    **Usage:** \`!!unlock [#Channel/Channel ID]\`
                    **Examples:** 
                    \`!!unlock\`
                    \`!!unlock #Channel\`
                    \`!!unlock 123456789012345678\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [unlockembed] })
                break;
            case "unmute":
                const unmuteCommand = new EmbedBuilder()
                    .setTitle("Unmute Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`unmute\`, \`um\`
                    **Usage:** \`!!unmute [@User/User ID]\`
                    **Examples:** 
                    \`!!unmute @User\`
                    \`!!unmute 123456789012345678\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [unmuteCommand] })
                break;
            case "warn":
                const warnEmbed = new EmbedBuilder()
                    .setTitle("Warn Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`warn\`, \`w\`
                    **Usage:** \`!!warn [@User/User ID] (Reason)\`
                    **Examples:** 
                    \`!!warn @User\`
                    \`!!unmute 123456789012345678 That's against our rules!\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [warnEmbed] })
                break;
            case "automod":
                const automodembed = new EmbedBuilder()
                    .setTitle("AutoMod Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`automod\`, \`am\`
                    **Usage:** \`!!automod [blocklinks/blockscam/massmention/mentionscap/whitelist/help] [true/false || website || mention cap]\`
                    **Examples:** 
                    \`!!automod blocklinks true\`
                    \`!!automute whitelist https://youtube.com\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [automodembed] })
                break;
            case "automute":
                const automuteEmbed = new EmbedBuilder()
                    .setTitle("AutoMute Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`automod\`, \`am\`
                    **Usage:** \`!!automod [warnsmute] [Limit]\`
                    **Examples:** 
                    \`!!automute warnsmute 3\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [automuteEmbed] })
                break;
            case "check":
                const checkEmbed = new EmbedBuilder()
                    .setTitle("Check Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`check\`
                    **Usage:** \`!!check\`
                    **Examples:** 
                    \`!!check\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [checkEmbed] })
                break;
            case "color":
                const colorEmbed = new EmbedBuilder()
                    .setTitle("Color Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`color\`, \`colour\`, \`c\`
                    **Usage:** \`!!color [Hex Code/reset]\`
                    **Examples:** 
                    \`!!color #000000\`
                    \`!!color reset\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [colorEmbed] })
                break;
            case "config":
                const configEmbed = new EmbedBuilder()
                    .setTitle("Config Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`config\`
                    **Usage:** \`!!config\`
                    **Examples:** 
                    \`!!config\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [configEmbed] })
                break;
            case "deleteusage":
                const deleteUsageEmbed = new EmbedBuilder()
                    .setTitle("Delete Command Usage Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`deleteusage\`, \`du\`
                    **Usage:** \`!!deleteusage [true/false/on/off]\`
                    **Examples:** 
                    \`!!deleteusage true\`
                    \`!!deleteusage false\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [deleteUsageEmbed] })
                break;
            case "dm":
                const DM = new EmbedBuilder()
                    .setTitle("Punishment DM Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`dm\`
                    **Usage:** \`!!dm [true/false/on/off]\`
                    **Examples:** 
                    \`!!dm true\`
                    \`!!dm false\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [DM] })
                break;
            case "joinrole":
                const joinRoleEmbed = new EmbedBuilder()
                    .setTitle("Join Role Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`joinrole\`
                    **Usage:** \`!!joinrole [set/view/reset] (@Role/Role ID)\`
                    **Examples:** 
                    \`!!joinrole view\`
                    \`!!joinrole set @Role\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [joinRoleEmbed] })
                break;
            case "modlogs":
                const modlog = new EmbedBuilder()
                    .setTitle("Mod Logs Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`modlogs\`
                    **Usage:** \`!!modlogs [set/view/reset] (#Channel/Channel ID)\`
                    **Examples:** 
                    \`!!modlogs set #Channel\`
                    \`!!joinrole view\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [modlog] })
                break;
            case "muterole":
                const muteRoleEmbed = new EmbedBuilder()
                    .setTitle("Mute Role Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`muterole\`
                    **Usage:** \`!!muterole [set/view/reset] (@Role/Role ID)\`
                    **Examples:** 
                    \`!!muterole view\`
                    \`!!muterole set @Role\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [muteRoleEmbed] })
                break;
            case "permit":
                const permitCommandEmbed = new EmbedBuilder()
                    .setTitle("Permit Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    The permit command gives users access to Boolean's commands via a permit system.
                    **Aliases:** \`permit\`, \`permits\`
                    **Usage:** \`!!permit [view || create/delete/adduser/removeuser/addrole/removerole/addcommand/removecommand/blockcommand/unblockcommand/automodbypass/rename] [(Permit Name)] [(Value)]\`
                    **Examples:** 
                    \`!!permit create PermitName\`
                    \`!!permit delete PermitName\`
                    \`!!permit adduser PermitName @User\`
                    \`!!permit addcommand PermitName BAN\`
                    *Note: this is how you give access to commands. You can also add roles to permits.*`)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [permitCommandEmbed] })
                break;
            case "prefix":
                const prefixCommand = new EmbedBuilder()
                    .setTitle("Prefix Command")
                    .setDescription(`\`\`\`md\n[] = Required Argument () = Optional Argument\`\`\`
                    **Aliases:** \`prefix\`
                    **Usage:** \`!!prefix [New Prefix/reset]\`
                    **Examples:** 
                    \`!!prefix ?\`
                    \`!!prefix reset\``)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() || undefined })
                message.channel.send({ embeds: [prefixCommand] })
                break;

            default:

                const allowedCommands2 = user
                const allowedCommandsIndex2 = allowedCommands2.indexOf(" `3dsaul`")

                if (allowedCommandsIndex2 > -1) {
                    allowedCommands2.splice(allowedCommandsIndex2, 1)
                }
                let prefix
                if (configuration?.prefix) {
                    prefix = configuration.prefix
                } else {
                    prefix = "!!"
                }
                const helpEmbed = new EmbedBuilder()
                    .setTitle("<:tasklist:967443053063327774> Help\n")
                    .setThumbnail(message.guild?.iconURL() || null)
                    .setDescription("<a:coin:893603823459905536> **[Premium](https://google.com)** | :newspaper: **[Features](https://google.com/)** | <:bughuntergold:967441675507105842> **[Support Server](https://discord.gg/VD4sf98hKd)**")
                    .addFields(
                        { name: "Current Guild Settings", value: `Prefix: \`${prefix}\`\nEmbed Color: \`#${configuration?.embedColor}\`\nPremium Status: \`${guildProp?.premium}\`` },
                        { name: "User Commands", value: `${allowedCommands2}`, inline: false },
                        { name: "Moderation Commands", value: `${mod}`, inline: false },
                        { name: "Config Commands", value: `${conf}`, inline: false }
                    )
                    .setColor(configuration?.embedColor as ColorResolvable)
                    .setFooter({ text: `${message.guild?.name} - v${bot.version}`, iconURL: message.guild?.iconURL() || undefined })
                message.channel.send({ embeds: [helpEmbed] })

        }

    },
}