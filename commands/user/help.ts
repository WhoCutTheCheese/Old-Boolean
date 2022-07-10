import { ButtonInteraction, Client, Message, MessageActionRow, MessageEmbed, MessageSelectMenu, } from 'discord.js';
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
module.exports = {
    commands: ['help'],
    minArgs: 0,
    maxArgs: 1,
    cooldown: 2,
    expectedArgs: ["(Command/Category)"],
    callback: async (client: Client, bot: { version: string }, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
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
                        .setColor(guildSettings.color)
                        .setDescription("Issue a warning to a user.\n<:arrow_right:967329549912248341> **Usage:** `warn [@User/User ID] (Reason)`\n<:arrow_right:967329549912248341> **Aliases** `warn`, `w`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MANAGE_MESSAGES`\n<:arrow:974101312818004009> **Allowed Role(s):** PLACEHOLDER\n<:arrow:974101312818004009> **Warns Til Mute:** `PLACEHOLDER NUMBER`")
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
                        .setColor(guildSettings.color)
                        .setDescription("Prevent a user from talking for an amount of time.\n<:arrow_right:967329549912248341> **Usage:** `mute [@User/User ID] (Time || Reason) {Reason}`\n<:arrow_right:967329549912248341> **Aliases** `mute`, `m`, `silence`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MODERATE_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** PLACEHOLDER\n<:arrow:974101312818004009> **Warns Til Mute:** `PLACEHOLDER NUMBER`")
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
                        .setColor(guildSettings.color)
                        .setDescription("Kick a user from the guild.\n<:arrow_right:967329549912248341> **Usage:** `mute [@User/User ID] (Reason)`\n<:arrow_right:967329549912248341> **Aliases** `mute`, `m`, `silence`\n<:arrow_right:967329549912248341> **Cooldown** `1s`")
                        .addField("Command Settings", "<:arrow:974101312818004009> **Permission:** `MODERATE_MEMBERS`\n<:arrow:974101312818004009> **Allowed Role(s):** PLACEHOLDER\n<:arrow:974101312818004009> **Warns Till Mute:** `PLACEHOLDER NUMBER`")
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
                default:
                    const chingChong = new MessageEmbed()
                        .setTitle("<:tasklist:967443053063327774> Help\n")
                        .setDescription("<a:coin:893603823459905536> **[Premium](https://google.com)** | :newspaper: **[Features](https://google.com/)** | <:bughuntergold:967441675507105842> **[Support Server](https://discord.gg/VD4sf98hKd)**")
                        .addField("Current Guild Settings", `Prefix: \`${guildSettings.prefix}\`\nEmbed Color: \`#${guildSettings.color}\`\nPremium Status: \`${guildSettings.premium}\``)
                        .setColor(guildSettings.color)
                        .addField("User Commands", "`ping`, `userinfo`, `serverinfo`, `avatar`, `botinfo`, `invite`, `help`")
                        .addField("Moderation Commands", "`warn`, `mute`, `kick`, `ban`, `softban`, `history`, `purge`, `lockdown`, `unlockdown`, `delcase`, `reason`, `slowmode`, `nickname`")
                        .addField("Config Commands", "`config`, `prefix`, `color`, `check`, `adminroleset`, `modroleset`, `modlogset`, `muterole`, `joinrole`")
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
                                        .setColor(guildSettings.color)
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
                                        .setColor(guildSettings.color)
                                        .setDescription("List of powerful moderation commands to keep your users in check!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/2", "<:arrow_right:967329549912248341> **Warn** - Issue a warning to a user\n<:arrow_right:967329549912248341> **Mute** - Mute a user\n<:arrow_right:967329549912248341> **Kick** - Kick a user\n<:arrow_right:967329549912248341> **Ban** - Ban a user\n<:arrow_right:967329549912248341> **History** - View a user's cases\n<:arrow_right:967329549912248341> **Purge** - Bulk delete messages", true)
                                        .addField("Commands 2/2", "<:arrow_right:967329549912248341> **Lockdown** - Removes talk for @everyone\n<:arrow_right:967329549912248341> **Unlockdown** - Adds talk for @everyone\n<:arrow_right:967329549912248341> **Delcase** - Delete a case\n<:arrow_right:967329549912248341> **Reason** - Change the reason of a case\n<:arrow_right:967329549912248341> **Slowmode** - Add slowmode to channel\n<:arrow_right:967329549912248341> **Nickname** - Change a user's nick", true)
                                    resultMessage.edit({
                                        embeds: [modCommands],
                                        components: [row],
                                    })
                                    break;
                                case "third":
                                    const configCommands = new MessageEmbed()
                                        .setTitle("⚙ Configuration Commands")
                                        .setColor(guildSettings.color)
                                        .setDescription("List of commands to setup Boolean!\nRun `help [Command]` to get information about a command.")
                                        .addField("Commands 1/1", "<:arrow_right:967329549912248341> **Config** - View the server's current settings\n<:arrow_right:967329549912248341> **Prefix** - Set Boolean's prefix\n<:arrow_right:967329549912248341> :coin: **Color** - Change Boolean's embed color\n<:arrow_right:967329549912248341> **Check** - Check what permissions Boolean needs to work\n<:arrow_right:967329549912248341> **Permission** - Set permissions for command/categories\n<:arrow_right:967329549912248341> **Modlogset** - Set the mod logging channel\n<:arrow_right:967329549912248341> **Muterole** - Set the mute role\n<:arrow_right:967329549912248341> **Joinrole** - Set the role given to users when they join", true)
                                    resultMessage.edit({
                                        embeds: [configCommands],
                                        components: [row],
                                    })
                                    break;
                                case "forth":
                                    const adminCommands = new MessageEmbed()
                                        .setTitle("☄ Administration Commands")
                                        .setColor(guildSettings.color)
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
                                        .setColor(guildSettings.color)
                                        .setDescription(`**Boolean - v${bot.version}** | Release\n\nNothing here yet! Check out the [wiki](https://google.com) for information on Boolean's features.`)
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
            (err: Error) => {
                ErrorLog(message.guild!, "HELP_COMMAND", err, client, message, `${message.author.id}`, `help.ts`)
            }
        }
    },
}