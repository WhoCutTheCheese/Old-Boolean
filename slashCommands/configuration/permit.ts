import Permits from "../../models/permits";
import Settings from "../../models/settings";
import { ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const validCommands = [
    "AUTOMOD",
    "AUTOMUTE",
    "CHECK",
    "COLOR",
    "CONFIG",
    "DM",
    "JOINROLE",
    "MODLOGS",
    "MUTEROLE",
    "PERMIT",
    "BAN",
    "CASE",
    "DELCASE",
    "HISTORY",
    "KICK",
    "LOCK",
    "MUTE",
    "NICKNAME",
    "PURGE",
    "UNBAN",
    "UNLOCK",
    "UNMUTE",
    "WARN",
    "REASON",
    "DELETEUSAGE",
    "CONFIGURATION",
    "MODERATION",
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permit")
        .setDescription("Edit anything relating to permits. Create, delete, add/remove user or roles and more!")
        .addStringOption(sub_command =>
            sub_command.setName("action")
                .setDescription("What action would you like to take?")
                .setRequired(true)
                .addChoices(
                    { name: "Create Permit", value: "create" },
                    { name: "Delete Permit", value: "delete" },
                    { name: "View Permits", value: "view" },
                    { name: "Add User", value: "addUser" },
                    { name: "Remove User", value: "removeUser" },
                    { name: "Add Role", value: "addRole" },
                    { name: "Remove Role", value: "removeRole" },
                    { name: "Allow Command", value: "allowCommand" },
                    { name: "Remove Allowed Command", value: "removeAllowCommand" },
                    { name: "Block Command", value: "blockCommand" },
                    { name: "Remove Blocked Command", value: "removeBlockCommand" },
                    { name: "Bypass Bans", value: "bypassban" },
                    { name: "Bypass Kicks", value: "bypasskick" },
                    { name: "Bypass Mutes", value: "bypassmute" },
                    { name: "Bypass Warns", value: "bypasswarn" },
                    { name: "Bypass Auto Moderation", value: "automodbypass" },
                    { name: "Edit Name", value: "editName" }
                )
        )
        .addStringOption(permitName =>
            permitName.setName("permit_name")
                .setDescription("Input the name of a permit, or the name of a NEW permit.")
                .setRequired(false)
                .setMaxLength(32)
                .setMinLength(3)
        )
        .addStringOption(command =>
            command.setName("command")
                .setDescription("Command name. For adding and removing commands from permits!")
                .setRequired(false)
        )
        .addUserOption(user =>
            user.setName("member")
                .setDescription("Input a member to add/remove from a permit.")
                .setRequired(false)
        )
        .addRoleOption(role =>
            role.setName("role")
                .setDescription("Input a role to add/remove from a permit.")
                .setRequired(false)
        )
        .addStringOption(new_name =>
            new_name.setName("edited_name")
                .setDescription("New name for a permit.")
                .setRequired(false)
                .setMaxLength(32)
                .setMinLength(3)
        )
        .addBooleanOption(boolean =>
            boolean.setName("boolean")
                .setRequired(false)
                .setDescription("True or False. For bypasses.")


        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if (!interaction.inCachedGuild()) return interaction.reply({ content: "This command is only available in guilds!", ephemeral: true })

        const settings = await Settings.findOne({
            guildID: interaction.guild?.id
        })
        if (!settings) return interaction.reply({ content: "Sorry, your settings file doesn't exist! If this error persists contact support", ephemeral: true })

        let color: ColorResolvable = "5865F2" as ColorResolvable;
        if (settings.guildSettings?.embedColor) color = settings.guildSettings.embedColor as ColorResolvable;

        const permits = await Permits.find({
            guildID: interaction.guild.id
        })

        let hasPermit: boolean = false
        const roles = interaction.member.roles.cache.map(role => role);
        let hasRole: boolean = false
        let ObjectID: any

        for (const role of roles) {
            for (const permit of permits) {
                if (permit.roles.includes(role.id)) {
                    hasRole = true
                    ObjectID = permit._id
                    break;
                } else {
                    hasRole = false
                }
            }
            if (hasRole == true) break;
        }

        for (const permit of permits) {
            if (permit.users.includes(interaction.user.id)) {
                ObjectID = permit._id;
                break;
            }
        }

        const thePermit = await Permits.findOne({
            _id: ObjectID
        })
        if (thePermit?.commandAccess.includes("PERMIT") || thePermit?.commandAccess.includes("CONFIGURATION")) hasPermit = true;
        if (thePermit?.commandBlocked.includes("PERMIT") || thePermit?.commandBlocked.includes("CONFIGURATION")) hasPermit = false;

        if (interaction.guild.ownerId === interaction.user.id) hasPermit = true
        if (hasPermit == false) return interaction.reply({ content: "<:no:979193272784265217> **ERROR** You are unable to use this command!", ephemeral: true })

        const action = interaction.options.getString("action");

        const permitName = interaction.options.getString("permit_name");

        const command = interaction.options.getString("command");

        const member = interaction.options.getMember("member");

        const role = interaction.options.getRole("role");

        const newName = interaction.options.getString("edited_name")

        const boolean = interaction.options.getBoolean("boolean")

        if (permitName) {
            if (/\s/.test(permitName!)) return interaction.reply({ content: "You cannot have empty spaces in permit names! Ex. `HiImAPermit`", ephemeral: true })
            if (!/^[a-z0-9]+$/i.test(permitName!)) return interaction.reply({ content: "Permit name cannot have non-alphanumeric character!", ephemeral: true })
        }
        switch (action) {
            case "create":

                let extraArg: boolean = false
                if (command || member || role) extraArg = true

                const permitNumber = await Permits.countDocuments({
                    guildID: interaction.guild.id
                })
                let maxPermits: number
                if (settings.guildSettings?.premium == false || !settings.guildSettings?.premium) {
                    maxPermits = 5
                } else {
                    maxPermits = 10
                }
                if (permitNumber > maxPermits) return interaction.reply({ content: `You have reached the maximum amount of permits. **(${maxPermits}/${maxPermits})**`, ephemeral: true })

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                const alreadyExists = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })
                if (alreadyExists) return interaction.reply({ content: `A permit under the name \`${permitName}\` already exists. Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                const newPermit = new Permits({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                    roles: [],
                    users: [],
                    commandAccess: [],
                    commandBlocked: [],
                    bypassBan: false,
                    bypassKick: false,
                    bypassWarn: false,
                    bypassMute: false,
                })
                newPermit.save()
                let description = `<:yes:979193272612298814> Successfully created permit named \`${permitName}\`! Run </permits Allow Command:${interaction.commandId}> to add an allowed commmand to your permit!`
                if (extraArg == true) description = description + `
                
                **It was unnecessary to add extra arguments to this**`
                const newPermitEmbed = new EmbedBuilder()
                    .setDescription(description)
                    .setTimestamp()
                    .setColor(color)
                interaction.reply({ embeds: [newPermitEmbed] })
                break;
            case "delete":

                let extraArgs: boolean = false
                if (command || member || role) extraArgs = true

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                const exists = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })

                if (!exists) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                await Permits.findOneAndDelete({
                    guildID: interaction.guild.id,
                }, {
                    permitName: permitName
                })

                let description2 = `<:no:979193272784265217> Permit \`${permitName}\` has been deleted! All roles and users no longer have access to any commands within that permit.`
                if (extraArgs == true) description = description2 + `
                
                **It was unnecessary to add extra arguments to this**`

                const deletedPermitEmbed = new EmbedBuilder()
                    .setDescription(description2)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [deletedPermitEmbed] })

                break;
            case "bypassban":

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                if (!boolean) return interaction.reply({ content: "You must enter a boolean option!", ephemeral: true })

                const foundPermit = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })
                if (!foundPermit) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                if (boolean == true) {

                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassBan: true
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Permit \`${permitName}\` now bypasses the ban command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })

                } else {
                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassBan: false
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Permit \`${permitName}\` no longer bypasses the ban command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })
                }

                break;

            case "bypasskick":

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                if (!boolean) return interaction.reply({ content: "You must enter a boolean option!", ephemeral: true })

                const foundPermit2 = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })
                if (!foundPermit2) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                if (boolean == true) {

                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassKick: true
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Permit \`${permitName}\` now bypasses the kick command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })

                } else {
                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassKick: false
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Permit \`${permitName}\` no longer bypasses the kick command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })
                }

                break;

            case "bypassmute":

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                if (!boolean) return interaction.reply({ content: "You must enter a boolean option!", ephemeral: true })

                const foundPermit3 = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })
                if (!foundPermit3) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                if (boolean == true) {

                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassWarn: true
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Permit \`${permitName}\` now bypasses the warn command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })

                } else {
                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassWarn: false
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Permit \`${permitName}\` no longer bypasses the warn command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })
                }

                break;

            case "bypassmute":

                if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                if (!boolean) return interaction.reply({ content: "You must enter a boolean option!", ephemeral: true })

                const foundPermit4 = await Permits.findOne({
                    permitName: permitName,
                    guildID: interaction.guild.id
                })
                if (!foundPermit4) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })

                if (boolean == true) {

                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassMute: true
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:yes:979193272612298814> Permit \`${permitName}\` now bypasses the mute command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })

                } else {
                    await Permits.findOneAndUpdate({
                        guildID: interaction.guild.id,
                        permitName: permitName
                    }, {
                        bypassMute: false
                    })

                    const bypassBanEmbed = new EmbedBuilder()
                        .setDescription(`<:no:979193272784265217> Permit \`${permitName}\` no longer bypasses the mute command!`)
                        .setColor(color)
                        .setTimestamp()
                    interaction.reply({ embeds: [bypassBanEmbed] })
                }

                break;

                case "automodbypass":

                    if (!permitName) return interaction.reply({ content: "You must enter a string in the `permit_name` option.", ephemeral: true })

                    if (!boolean) return interaction.reply({ content: "You must enter a boolean option!", ephemeral: true })
    
                    const foundPermit5 = await Permits.findOne({
                        permitName: permitName,
                        guildID: interaction.guild.id
                    })
                    if (!foundPermit5) return interaction.reply({ content: `A permit under the name \`${permitName}\` does not exist! Run </permit View Permits:${interaction.commandId}> to view a list of permits.`, ephemeral: true })
    
                    if (boolean == true) {
    
                        await Permits.findOneAndUpdate({
                            guildID: interaction.guild.id,
                            permitName: permitName
                        }, {
                            autoModBypass: true
                        })
    
                        const bypassBanEmbed = new EmbedBuilder()
                            .setDescription(`<:yes:979193272612298814> Permit \`${permitName}\` now bypasses Auto Moderation!`)
                            .setColor(color)
                            .setTimestamp()
                        interaction.reply({ embeds: [bypassBanEmbed] })
    
                    } else {
                        await Permits.findOneAndUpdate({
                            guildID: interaction.guild.id,
                            permitName: permitName
                        }, {
                            autoModBypass: false
                        })
    
                        const bypassBanEmbed = new EmbedBuilder()
                            .setDescription(`<:no:979193272784265217> Permit \`${permitName}\` no longer bypasses Auto Moderation!`)
                            .setColor(color)
                            .setTimestamp()
                        interaction.reply({ embeds: [bypassBanEmbed] })
                    }

                    break;

            case "view":

                let permitsArray: String[] = []
                const loopPermits = await Permits.find({
                    guildID: interaction.guild.id
                })
                for (const permit of loopPermits) {
                    let roles: String[] = []
                    let users: String[] = []
                    let allowedCommands: String[] = []
                    let disallowedCommands: String[] = []
                    for (const role of permit.roles) {
                        roles.push(` <@&${role}>`)
                    }
                    for (const user of permit.users) {
                        users.push(` <@${user}>`)
                    }
                    for (const allowedCommand of permit.commandAccess) {
                        allowedCommands.push(` ${allowedCommand}`)
                    }
                    for (const notAllowedCommand of permit.commandBlocked) {
                        disallowedCommands.push(` ${notAllowedCommand}`)
                    }
                    if (roles.length == 0) roles.push("None")
                    if (users.length == 0) users.push("None")
                    if (allowedCommands.length == 0) allowedCommands.push("None")
                    if (disallowedCommands.length == 0) disallowedCommands.push("None")
                    permitsArray.push(`\n**${permit.permitName}**:
                    > **Added Roles:** ${roles}
                    > **Added Users:** ${users}
                    > **Allowed Commands:** ${allowedCommands}
                    > **Blocked Commands:** ${disallowedCommands}`)
                }
                if (permitsArray.length == 0) permitsArray.push(`\nThis guild has no permits!`)
                const listEmbed = new EmbedBuilder()
                    .setAuthor({ name: "Current Permits", iconURL: interaction.guild.iconURL() || undefined })
                    .setDescription(`Current permits, what commands they can use and who has access to them.
                    ${permitsArray}`)
                    .setColor(color)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined })
                interaction.reply({ embeds: [listEmbed] })

                break;
            case "addRole":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!role) return interaction.reply({ content: "You must input a role in the `role` option.", ephemeral: true })

                if (!interaction.guild.roles.cache.get(role.id)) return interaction.reply({ content: "Invalid role! Please input a role in the `role` option.", ephemeral: true })

                const permitExists = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!permitExists) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (permitExists.roles.includes(role.id)) return interaction.reply({ content: `Permit \`${permitName}\` already contains \`@${role.name}\`!`, ephemeral: true })

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                }, {
                    permitName: permitName,
                    $push: { roles: role.id }
                })
                const permitAddRoles = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully added \`@${role.name}\` to \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitAddRoles] })

                break;
            case "removeRole":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!role) return interaction.reply({ content: "You must input a role in the `role` option.", ephemeral: true })

                if (!interaction.guild.roles.cache.get(role.id)) return interaction.reply({ content: "Invalid role! Please input a role in the `role` option.", ephemeral: true })

                const permitExist = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!permitExist) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (!permitExist.roles.includes(role.id)) return interaction.reply({ content: `Permit \`${permitName}\` does not contain \`@${role.name}\`!`, ephemeral: true })

                const roles = permitExist.roles
                const index = roles.indexOf(role.id)

                if (index > -1) {
                    roles.splice(index, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    roles: roles
                })
                const permitRemoveRoles = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Removed \`@${role.name}\` from \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitRemoveRoles] })

                break;
            case "addUser":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!member) return interaction.reply({ content: "You must input a user in the `member` option.", ephemeral: true })

                if (!interaction.guild.members.cache.get(member.id)) return interaction.reply({ content: "Invalid user! Please input a user in the `member` option.", ephemeral: true })

                const doesPermitExists = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!doesPermitExists) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (doesPermitExists.users.includes(member.id)) return interaction.reply({ content: `Permit \`${permitName}\` already contains \`${member.user.tag}\`!`, ephemeral: true })

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    $push: { users: member.id }
                })
                const permitAddUser = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Successfully added \`${member.user.tag}\` to \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitAddUser] })

                break;
            case "removeUser":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!member) return interaction.reply({ content: "You must input a user in the `member` option.", ephemeral: true })

                if (!interaction.guild.members.cache.get(member.id)) return interaction.reply({ content: "Invalid user! Please input a user in the `member` option.", ephemeral: true })

                const doesPermitExists2 = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!doesPermitExists2) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (!doesPermitExists2.users.includes(member.id)) return interaction.reply({ content: `Permit \`${permitName}\` does not contain \`${member.user.tag}\`!`, ephemeral: true })

                const roles2 = doesPermitExists2.users
                const index2 = roles2.indexOf(member.id)

                if (index2 > -1) {
                    roles2.splice(index2, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    users: roles2
                })
                const permitRemoveUser = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Removed \`${member.user.tag}\` from \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitRemoveUser] })

                break;
            case "allowCommand":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!command) return interaction.reply({ content: "You must input any of Boolean's commands in the `command` option.", ephemeral: true })

                let validCommandsFormatted: String[] = []
                for (const commandE of validCommands) {
                    validCommandsFormatted.push(` \`${commandE}\``)
                }
                if (!validCommands.includes(command.toUpperCase())) return interaction.reply({ content: "Invalid command! Valid commands are: " + validCommandsFormatted, ephemeral: true })

                const isPermitAThing = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!isPermitAThing) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (isPermitAThing.commandAccess.includes(command.toUpperCase())) return interaction.reply({ content: `Permit \`${permitName}\`'s Allowed Commands already contains \`${command}\`!`, ephemeral: true })


                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    $push: { commandAccess: command.toUpperCase() }
                })
                const permitAllowCommand = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Allowed \`${command.toUpperCase()}\` for users of \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitAllowCommand] })

                break;
            case "removeAllowCommand":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!command) return interaction.reply({ content: "You must input any of Boolean's commands in the `command` option.", ephemeral: true })

                let validCommandsFormatted2: String[] = []
                for (const commandE of validCommands) {
                    validCommandsFormatted2.push(` \`${commandE}\``)
                }
                if (!validCommands.includes(command.toUpperCase())) return interaction.reply({ content: "Invalid command! Valid commands are: " + validCommandsFormatted2, ephemeral: true })

                const isPermitAThing2 = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!isPermitAThing2) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (!isPermitAThing2.commandAccess.includes(command.toUpperCase())) return interaction.reply({ content: `Permit \`${permitName}\`'s Allowed Commands does not contain \`${command}\`!`, ephemeral: true })

                const allowedCommands = isPermitAThing2.commandAccess
                const allowedCommandsIndex = allowedCommands.indexOf(command)

                if (allowedCommandsIndex > -1) {
                    allowedCommands.splice(allowedCommandsIndex, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    commandAccess: allowedCommands
                })
                const removeAllowedCommandsEmbed = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Removed \`${command}\` from \`${permitName}\`'s Allowed Commands!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [removeAllowedCommandsEmbed] })

                break;
            case "blockCommand":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!command) return interaction.reply({ content: "You must input any of Boolean's commands in the `command` option.", ephemeral: true })

                let validCommandsFormatted3: String[] = []
                for (const commandE of validCommands) {
                    validCommandsFormatted3.push(` \`${commandE}\``)
                }
                if (!validCommands.includes(command.toUpperCase())) return interaction.reply({ content: "Invalid command! Valid commands are: " + validCommandsFormatted3, ephemeral: true })

                const isPermitAThing3 = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!isPermitAThing3) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (isPermitAThing3.commandBlocked.includes(command.toUpperCase())) return interaction.reply({ content: `Permit \`${permitName}\`'s Denied Commands already contains \`${command}\`!`, ephemeral: true })


                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    $push: { commandBlocked: command.toUpperCase() }
                })
                const permitDenyCommandEmbed = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Denied \`${command.toUpperCase()}\` for users of \`${permitName}\`!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [permitDenyCommandEmbed] })

                break;
            case "removeBlockCommand":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!command) return interaction.reply({ content: "You must input any of Boolean's commands in the `command` option.", ephemeral: true })

                let validCommandsFormatted4: String[] = []
                for (const commandE of validCommands) {
                    validCommandsFormatted4.push(` \`${commandE}\``)
                }
                if (!validCommands.includes(command.toUpperCase())) return interaction.reply({ content: "Invalid command! Valid commands are: " + validCommandsFormatted4, ephemeral: true })

                const isPermitAThing4 = await Permits.findOne({
                    guildID: interaction.guild.id,
                    permitName: permitName
                })
                if (!isPermitAThing4) return interaction.reply({ content: `A permit by the name \`${permitName}\` does not exist.`, ephemeral: true })

                if (!isPermitAThing4.commandBlocked.includes(command.toUpperCase())) return interaction.reply({ content: `Permit \`${permitName}\`'s Denied Commands does not contain \`${command}\`!`, ephemeral: true })

                const allowedCommands2 = isPermitAThing4.commandBlocked
                const allowedCommandsIndex2 = allowedCommands2.indexOf(command)

                if (allowedCommandsIndex2 > -1) {
                    allowedCommands2.splice(allowedCommandsIndex2, 1)
                }

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName,
                }, {
                    commandBlocked: allowedCommands2
                })
                const removeDeniedCommandsEmbed = new EmbedBuilder()
                    .setDescription(`<:no:979193272784265217> Removed \`${command}\` from \`${permitName}\`'s Denied Commands!`)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [removeDeniedCommandsEmbed] })

                break;
            case "editName":

                if (!permitName) return interaction.reply({ content: "You must input a string in the `permit_name` option.", ephemeral: true })
                if (!newName) return interaction.reply({ content: "You must input a string in the `edited_name` option.", ephemeral: true })

                await Permits.findOneAndUpdate({
                    guildID: interaction.guild.id,
                    permitName: permitName
                }, {
                    permitName: newName
                })
                const newNameEmbed = new EmbedBuilder()
                    .setDescription(`<:yes:979193272612298814> Changed \`${permitName}\`'s name to \`${newName}\``)
                    .setColor(color)
                    .setTimestamp()
                interaction.reply({ embeds: [newNameEmbed] })
                break;
        }

    }
}