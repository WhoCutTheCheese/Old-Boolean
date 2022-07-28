import { MessageActionRow, MessageSelectMenu, MessageEmbed, ButtonInteraction } from "discord.js";
import { ICommand } from "wokcommands";
const bot = require("../../package.json")
import Config from "../../models/config";
const Prefix = require("../../node_modules/wokcommands/dist/models/prefixes");
import Guild from "../../models/guild";
export default {
    category: "User",
    description: "Help command!",
    slash: false,
    maxArgs: 0,

    callback: async ({ channel, client, message, interaction, args }) => {
        try {
            const configuration = await Config.findOne({
                guildID: message.guild?.id
            })
            const guildSettings = await Prefix.findOne({
                _id: message.guild?.id,
            })
            const premiumStatus = await Guild.findOne({
                guildID: message.guild?.id
            })
            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`help-menu.${message.author.id}`)
                    .setPlaceholder("Select a command category!")
                    .addOptions([{
                        label: "User Commands",
                        value: "first",
                        emoji: "🎮",
                    }, {
                        label: "Mod Commands",
                        value: "second",
                        emoji: "🔨",
                    }, {
                        label: "Config Commands",
                        value: "third",
                        emoji: "⚙",
                    }, {
                        label: "Admin Commands",
                        value: "forth",
                        emoji: "☄",
                    }, {
                        label: "Change Log",
                        value: "fifth",
                        emoji: "⬆",
                    }]))
            switch (args[0]) {
                case "ping":
                case "p":
                case "latency":
                    const pingHelpEmbed = new MessageEmbed()
                        .setTitle(":ping_pong: Ping Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Neatly display Bot and API latency.\n<:arrow_right:967329549912248341> **Usage:** `ping`\n<:arrow_right:967329549912248341> **Aliases** `ping`, `p`, `latency`\n<:arrow_right:967329549912248341> **Cooldown** `0s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [pingHelpEmbed]
                    })
                    break;
                case "userinfo":
                case "uinfo":
                case "whois":
                    const userInfoHelpEmbed = new MessageEmbed()
                        .setTitle(":clipboard: User Info Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Neatly display a plethora of information regarding a user.\n<:arrow_right:967329549912248341> **Usage:** `userinfo (@User/User ID)`\n<:arrow_right:967329549912248341> **Aliases** `userinfo`, `user-info`, `uinfo`, `whois`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [userInfoHelpEmbed]
                    })
                    break;
                case "serverinfo":
                case "sinfo":
                case "si":
                    const serverInfoHelpEmbed = new MessageEmbed()
                        .setTitle(":keyboard: Server Info Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Displays information on the current guild.\n<:arrow_right:967329549912248341> **Usage:** `serverinfo`\n<:arrow_right:967329549912248341> **Aliases** `serverinfo`, `server-info`, `sinfo`, `si`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [serverInfoHelpEmbed]
                    })
                    break;
                case "avatar":
                case "av":
                case "pfp":
                    const avatarHelpEmbed = new MessageEmbed()
                        .setTitle(":art: Avatar Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Display a larger version of your/someone else's profile picture.\n<:arrow_right:967329549912248341> **Usage:** `avatar (@User/User ID)`\n<:arrow_right:967329549912248341> **Aliases** `avatar`, `av`, `pfp`\n<:arrow_right:967329549912248341> **Cooldown** `3s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [avatarHelpEmbed]
                    })
                    break;
                case "botinfo":
                case "bot":
                    const booleanHelpEmbed = new MessageEmbed()
                        .setTitle("👨‍💻 Bot Info Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Get information about Boolean.\n<:arrow_right:967329549912248341> **Usage:** `botinfo`\n<:arrow_right:967329549912248341> **Aliases** `botinfo`, `bot`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [booleanHelpEmbed]
                    })
                    break;
                case "invite":
                case "add":
                    const invitHelpEmbed = new MessageEmbed()
                        .setTitle("✉ Invite Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Invite Boolean.\n<:arrow_right:967329549912248341> **Usage:** `invite`\n<:arrow_right:967329549912248341> **Aliases** `invite`, `add`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [invitHelpEmbed]
                    })
                    break;
                case "warn":
                case "w":
                    const warnHelpEmbed = new MessageEmbed()
                        .setTitle("🛠 Warn Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Issue a warning to a user.\n<:arrow_right:967329549912248341> **Usage:** `warn [@User/User ID] (Reason)`\n<:arrow_right:967329549912248341> **Aliases** `warn`, `w`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [warnHelpEmbed]
                    })
                    break;
                case "mute":
                case "m":
                case "silence":
                    const muteHelpEmbed = new MessageEmbed()
                        .setTitle("🛠 Mute Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Prevent a user from talking for an amount of time.\n<:arrow_right:967329549912248341> **Usage:** `mute [@User/User ID] (Time || Reason) {Reason}`\n<:arrow_right:967329549912248341> **Aliases** `mute`, `m`, `silence`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MODERATE_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`\n<:arrow:974101312818004009> **Warns Til Mute:** `Coming Soon`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [muteHelpEmbed]
                    })
                    break;
                case "kick":
                case "k":
                    const kickHelpEmbed = new MessageEmbed()
                        .setTitle("🛠 Kick Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Kick a user from the guild.\n<:arrow_right:967329549912248341> **Usage:** `mute [@User/User ID] (Reason)`\n<:arrow_right:967329549912248341> **Aliases** `mute`, `m`, `silence`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `KICK_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [kickHelpEmbed]
                    })
                    break;
                case "unmute":
                case "um":
                    const unmuteEmbed = new MessageEmbed()
                        .setTitle("🛠 Unmute Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Unmute a user.\n<:arrow_right:967329549912248341> **Usage:** `unmute [@User/User ID]`\n<:arrow_right:967329549912248341> **Aliases** `unmute`, `um`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MODERATE_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [unmuteEmbed]
                    })
                    break;
                case "unban":
                case "ub":
                    const unbanEmbed = new MessageEmbed()
                        .setTitle("🛠 Unban Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Unban a user.\n<:arrow_right:967329549912248341> **Usage:** `unban [@User/User ID]`\n<:arrow_right:967329549912248341> **Aliases** `unban`, `ub`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `BAN_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [unbanEmbed]
                    })
                    break;
                case "ban":
                case "b":
                    const banEmbed = new MessageEmbed()
                        .setTitle("🛠 Ban Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Ban a user.\n<:arrow_right:967329549912248341> **Usage:** `unban [@User/User ID] (Time || Reason) {Reason}`\n<:arrow_right:967329549912248341> **Aliases** `ban`, `b`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `BAN_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [banEmbed]
                    })
                    break;
                case "softban":
                case "sb":
                    const softBanEmbed = new MessageEmbed()
                        .setTitle("🛠 SoftBan Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Bans an immediately unbans a member to clear all their messages.\n<:arrow_right:967329549912248341> **Usage:** `unban [@User/User ID] (Days to Delete)`\n<:arrow_right:967329549912248341> **Aliases** `softban`, `sb`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `BAN_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [softBanEmbed]
                    })
                    break;
                case "history":
                case "h":
                    const historyHelpEmbed = new MessageEmbed()
                        .setTitle("🛠 History Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Show a user's punishment history.\n<:arrow_right:967329549912248341> **Usage:** `history (@User/User ID)`\n<:arrow_right:967329549912248341> **Aliases** `history`, `h`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [historyHelpEmbed]
                    })
                    break;
                case "purge":
                case "clear":
                    const purgeHelpEmbed = new MessageEmbed()
                        .setTitle("🛠 Purge Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Clear a number of messages.\n<:arrow_right:967329549912248341> **Usage:** `purge [Number]`\n<:arrow_right:967329549912248341> **Aliases** `purge`, `clear`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [purgeHelpEmbed]
                    })
                    break;
                case "lockdown":
                case "ld":
                case "lock":
                    const lockdownHelp = new MessageEmbed()
                        .setTitle("🛠 Lockdown Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Sets perms for \@everyone to :x: in that channel.\n<:arrow_right:967329549912248341> **Usage:** `lockdown [#channel || Channel ID]`\n<:arrow_right:967329549912248341> **Aliases** `lockdown`, `ld`, `lock`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [lockdownHelp]
                    })
                    break;
                case "unlockdown":
                case "uld":
                case "unlock":
                    const unLockdownHelp = new MessageEmbed()
                        .setTitle("🛠 Unlockdown Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Sets perms for \@everyone to :check: in that channel.\n<:arrow_right:967329549912248341> **Usage:** `unlockdown [#channel || Channel ID]`\n<:arrow_right:967329549912248341> **Aliases** `unlockdown`, `uld`, `unlock`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [unLockdownHelp]
                    })
                    break;
                case "delcase":
                case "unwarn":
                    const delcaseHelp = new MessageEmbed()
                        .setTitle("🛠 Delcase Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Delete a case from a user's history.\n<:arrow_right:967329549912248341> **Usage:** `delcase [@User || User ID] [Case Number]`\n<:arrow_right:967329549912248341> **Aliases** `delcalse`, `unwarn`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [delcaseHelp]
                    })
                    break;
                case "reason":
                case "r":
                    const reasonHelp = new MessageEmbed()
                        .setTitle("🛠 Reason Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Change the reason of a case.\n<:arrow_right:967329549912248341> **Usage:** `reason [Case Number] [New Reason]`\n<:arrow_right:967329549912248341> **Aliases** `reason`, `r`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [reasonHelp]
                    })
                    break;
                case "slowmode":
                case "slow":
                case "cooldown":
                    const slowmodeHelp = new MessageEmbed()
                        .setTitle("🛠 Slowmode Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Set the slowmode of a channel.\n<:arrow_right:967329549912248341> **Usage:** `slowmode [Number (in seconds)]`\n<:arrow_right:967329549912248341> **Aliases** `slowmode`, `slow`, `cooldown`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [slowmodeHelp]
                    })
                    break;
                case "nickname":
                case "nick":
                case "n":
                    const nicknameHelp = new MessageEmbed()
                        .setTitle("🛠 Nickname Help")
                        .setColor(configuration.embedColor)
                        .setDescription("Change a user's nickname.\n<:arrow_right:967329549912248341> **Usage:** `nickname [@User || User ID] [New Nickname]`\n<:arrow_right:967329549912248341> **Aliases** `nickname`, `nick`, `n`\n<:arrow_right:967329549912248341> **Cooldown** `5s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_NICKNAMES`\n<:arrow:974101312818004009> **Allowed Role(s):** \`MODERATORS\`")
                        .setFooter({
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                    message.channel.send({
                        embeds: [nicknameHelp]
                    })
                    break;
                default:
                    const chingChong = new MessageEmbed()
                        .setTitle("<:tasklist:967443053063327774> Help\n")
                        .setDescription("<a:coin:893603823459905536> **[Premium](https://google.com)** | :newspaper: **[Features](https://google.com/)** | <:bughuntergold:967441675507105842> **[Support Server](https://discord.gg/VD4sf98hKd)**")
                        .addField("Current Guild Settings", `Prefix: \`${configuration.embedColor}\`\nEmbed Color: \`#${configuration.embedColor}\`\nPremium Status: \`${premiumStatus.premium}\``)
                        .setColor(configuration.embedColor)
                        .addField("User Commands", "`ping`, `userinfo`, `serverinfo`, `avatar`, `botinfo`, `invite`, `help`")
                        .addField("Moderation Commands", "`warn`, `mute`, `kick`, `ban`, `softban`, `unban`, `unmute`, `history`, `purge`, `lockdown`, `unlockdown`, `delcase`, `reason`, `slowmode`, `nickname`")
                        .addField("Config Commands", "`config`, `prefix`, `color`, `check`, `automute`, `adminroleset`, `modroleset`, `dm`, `modlogset`, `muterole`, `joinrole`")
                        .addField("Administration Commands", "`deleteallcases`, `premium`")
                        .setFooter({ text: `${message.guild?.name} - v${bot.version}`, iconURL: message.guild?.iconURL({ dynamic: true }) || "" })
                    message.channel.send({
                        embeds: [chingChong],
                        components: [row]
                    }).then((resultMessage: any) => {
                        const filter = (Interaction: any) => {
                            if (Interaction.user.id === message.author.id) return true;
                        }
                        const Buttoncollector = resultMessage.createMessageComponentCollector({
                            filter,
                            componentType: "SELECT_MENU",
                            time: 15000,
                        })
                        Buttoncollector.on('end', () => {
                            row.components[0].setDisabled(true)
                            resultMessage.edit({
                                components: [row]
                            })
                        })
                        Buttoncollector.on('collect', async (i: ButtonInteraction) => {
                            await i.deferUpdate()
                            switch ((i as any).values[0]) {
                                case "first":
                                    const userCommands = new MessageEmbed()
                                        .setTitle("🎮 User Commands")
                                        .setColor(configuration.embedColor)
                                        .setDescription("List of commands that are accessable by every user!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/1", "<:arrow_right:967329549912248341> **Ping** - Display API and Bot latency\n<:arrow_right:967329549912248341> **Userinfo** - Display info on a user\n<:arrow_right:967329549912248341> **Serverinfo** - Display info on the guild\n<:arrow_right:967329549912248341> **Avatar** - Display a user's avatar\n<:arrow_right:967329549912248341> **Botinfo** - Display info on Boolean\n<:arrow_right:967329549912248341> **Invite** - Invite Boolean\n<:arrow_right:967329549912248341> **Help** - Help menu", true)
                                    resultMessage.edit({
                                        embeds: [userCommands],
                                        components: [row],
                                    })
                                    break;
                                case "second":
                                    const modCommands = new MessageEmbed()
                                        .setTitle("🔨 Moderation Commands")
                                        .setColor(configuration.embedColor)
                                        .setDescription("List of powerful moderation commands to keep your users in check!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/2", "<:arrow_right:967329549912248341> **Warn** - Issue a warning to a user\n<:arrow_right:967329549912248341> **Mute** - Mute a user\n<:arrow_right:967329549912248341> **Kick** - Kick a user\n<:arrow_right:967329549912248341> **Ban** - Ban a user\n<:arrow_right:967329549912248341> **Unban** - Unban a user\n<:arrow_right:967329549912248341> **Unmute** - Unmute a user\n<:arrow_right:967329549912248341> **History** - View a user's cases\n<:arrow_right:967329549912248341> **Purge** - Bulk delete messages", true)
                                        .addField("Commands 2/2", "<:arrow_right:967329549912248341> **Lockdown** - Removes talk for @everyone\n<:arrow_right:967329549912248341> **Unlockdown** - Adds talk for @everyone\n<:arrow_right:967329549912248341> **Delcase** - Delete a case\n<:arrow_right:967329549912248341> **Reason** - Change the reason of a case\n<:arrow_right:967329549912248341> **Slowmode** - Add slowmode to channel\n<:arrow_right:967329549912248341> **Nickname** - Change a user's nick", true)
                                    resultMessage.edit({
                                        embeds: [modCommands],
                                        components: [row],
                                    })
                                    break;
                                case "third":
                                    const configCommands = new MessageEmbed()
                                        .setTitle("⚙ Configuration Commands")
                                        .setColor(configuration.embedColor)
                                        .setDescription("List of commands to setup Boolean!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/1", "<:arrow_right:967329549912248341> **Config** - View the server's current settings\n<:arrow_right:967329549912248341> **Prefix** - Set Boolean's prefix\n<:arrow_right:967329549912248341> :coin: **Color** - Change Boolean's embed color\n<:arrow_right:967329549912248341> **Check** - Check what permissions Boolean needs to work\n<:arrow_right:967329549912248341> **Permission** - Set permissions for command/categories\n<:arrow_right:967329549912248341> **Modlogset** - Set the mod logging channel\n<:arrow_right:967329549912248341> **Muterole** - Set the mute role\n<:arrow_right:967329549912248341> **Joinrole** - Set the role given to users when they join\n<:arrow_right:967329549912248341> **Automute** - Set the amount of warns for automute", true)
                                    resultMessage.edit({
                                        embeds: [configCommands],
                                        components: [row],
                                    })
                                    break;
                                case "forth":
                                    const adminCommands = new MessageEmbed()
                                        .setTitle("☄ Administration Commands")
                                        .setColor(configuration.embedColor)
                                        .setDescription("List of powerful commands only Administrators have access to!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/1", "<:arrow_right:967329549912248341> 🛑 **Deleteallcases** - Deletes all case files stored by Boolean\n<:arrow_right:967329549912248341> :coin: **Premium** - Activate premium", true)
                                    resultMessage.edit({
                                        embeds: [adminCommands],
                                        components: [row],
                                    })
                                    break;
                                case "fifth":
                                    const changeLog = new MessageEmbed()
                                        .setTitle("📰 Change Log")
                                        .setColor(configuration.embedColor)
                                        .setDescription(`**Boolean - v${bot.version}** | Slash Commands & More!
                                        > Boolean has been effectively rewritten, every command now supports slash commands, a few renamed, and many changes. This update also should help Boolean's stability, but we'll see!
                                        > 
                                        > :plus: **!!<command> **->** !!<command> & /<command>**
                                        > :plus: Security and stability updates
                                        > :plus: Mod logs will now display more accurate details on the command ran
                                        > :plus: https://discordbotlist.com/bots/boolean button added to **!!invite**
                                        > :plus: Completely new command handler that supports slash command and improves stability
                                        > :plus: Ability to disabled commands via **!!command**
                                        > :plus: Unban & Unmute now create a case file & will show up on a user's history
                                        > :plus: Added "DM User When Punished" to **!!config**
                                        > 
                                        > :recommended: **Modroleset** & **Adminroleset** renamed to: **Modrole** & **Adminrole**
                                        > :recommended:  **!!dmonpunish** renamed to: **dm**
                                        > 
                                        > :octagonal_sign:  *These are very large changes, you probably will encounter bugs. Please report these if they arise, thanks! Also! Some settings have been reset, such as your server prefix since some database changes were made.*
                                        
                                        **Boolean - v1.0.1** | Auto Mute

                                        Boolean can now automatically mute a user with a specified amount of warns.
                                        By default this limit is \`3\` but can be changed by running \`!!automute warnsmute [Number]\`
                                        When exceeded the user will be muted for 10 minutes. Have any feedback? Join our [support server](https://discord.gg/G2EhQCZZfh)

                                        
                                        **Boolean - v1.0.0** | Release
                                        
                                        Nothing here yet! Check out the [wiki](https://google.com) for information on Boolean's features.`)
                                    resultMessage.edit({
                                        embeds: [changeLog],
                                        components: [row],
                                    })
                                    break;
                            }
                        })
                    })
            }
        } catch {
            ((err: Error) => {
                console.log(err)
                return true;
            })
        }


    }
} as ICommand