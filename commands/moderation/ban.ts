import { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionsBitField, ColorResolvable, TextChannel, EmbedBuilder, UserResolvable, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Configuration from "../../models/config"
import GuildProperties from "../../models/guild";
import Bans from "../../models/bans";
import Cases from "../../models/cases";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban members from your guild.")
        .addUserOption(user =>
            user.setName("user")
                .setRequired(true)
                .setDescription("User you would like to ban.")
        )
        .addStringOption(reason =>
            reason.setName("reason")
                .setRequired(false)
                .setDescription("Reason for ban.")
        )
        .addStringOption(time =>
            time.setName("time")
                .setRequired(false)
                .setDescription("Time for ban. Not required for Soft Bans")
        )
        .addStringOption(modifier => 
            modifier.setName("modifier")
                .setDescription("Modify how Boolean will ban this user.")
                .setRequired(false)
                .addChoices(
                    { name: "Soft Ban", value: "-s" }
                )    
        )
        .addNumberOption(uwu =>
            uwu.setName("delete_days")
                .setDescription("How many days back you would like to remove")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (!interaction.inCachedGuild()) { return interaction.reply({ content: "You can only use this command in cached guilds!" }); }

        const configuration = await Configuration.findOne({
            guildID: interaction.guild.id
        })
        const color = configuration?.embedColor as ColorResolvable

        const guildProp = await GuildProperties.findOne({
            guildID: interaction.guild.id,
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Invite Me!")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=966634522106036265&permissions=1377007168710&scope=bot%20applications.commands")
            )

        if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.SendMessages])) return interaction.reply({ content: "I do not have permission to ban members!", ephemeral: true })

        let user = interaction.options.getUser("user")
        if (!user) return interaction.reply({ content: "Invalid user! How?", ephemeral: true })

        let reason = interaction.options.getString("reason")
        if (!reason) reason = "No reason provided."
        if (reason.length > 200) return interaction.reply({ content: "Reason exceeds maximum length. (200 Characters)" })

        const time = interaction.options.getString("time")

        let deleteDays = interaction.options.getNumber("delete_days") as number

        if(deleteDays < 0 || deleteDays > 7) return interaction.reply({ content: "Delete days is invalid. Must be less than 7 days and greater than 0 days." })

        if(!deleteDays) deleteDays = 0

        const modifier = interaction.options.getString("modifier")

        if (user.id === interaction.user.id) return interaction.reply({ content: "You cannot ban yourself.", ephemeral: true })

        let member = interaction.guild.members.cache.get(user.id)
        if (member) {
            if (interaction.user.id !== interaction.guild.ownerId) {
                if (member.roles.highest >= interaction.guild.roles.highest) return interaction.reply({ content: "You cannot ban users above you!", ephemeral: true })
            }
        }

        if (user.id === interaction.guild.ownerId) return interaction.reply({ content: "You cannot ban this user!", ephemeral: true })
        const warns = await Cases.countDocuments({ userID: user.id, caseType: "Warn" })
        if(interaction.guild.members.me.roles.highest.position < member?.roles.highest.position!) return interaction.reply({ content: "I am under this user! I cant ban them!", ephemeral: true })

        const caseNumberSet = guildProp?.totalCases! + 1;

        await GuildProperties.findOneAndUpdate({
            guildID: interaction.guild.id
        }, {
            totalCases: caseNumberSet,
        })
        if (time) {
            if (/^\d/.test(time)) {
                if (endsWithAny(["s", "m", "h", "d", "w"], time)) {
                    let time1 = time.replace("s", "").replace("m", "").replace("h", "").replace("d", "").replace("w", "");
                    if (isNaN(Number(time1))) return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })


                    let type: any
                    if (time.endsWith("s")) {
                        type = "second(s)"
                    } else if (time.endsWith("m")) {
                        type = "minute(s)"
                    } else if (time.endsWith("h")) {
                        type = "hour(s)"
                    } else if (time.endsWith("d")) {
                        type = "day(s)"
                    } else if (time.endsWith("w")) {
                        type = "week(s)"
                    }

                    let length: number;
                    if (type === "second(s)") {
                        length = parseInt(time1);
                    } else if (type === "minute(s)") {
                        length = parseInt(time1) * 60
                    } else if (type === "hour(s)") {
                        length = parseInt(time1) * 60 * 60
                    } else if (type === "day(s)") {
                        length = parseInt(time1) * 60 * 60 * 24
                    } else if (type === "week(s)") {
                        length = parseInt(time1) * 60 * 60 * 24 * 7
                    }

                    const expires = new Date()

                    expires.setSeconds(expires.getSeconds() + length!)

                    const banExpire = await new Bans({
                        guildID: interaction.guild.id,
                        userID: user.id,
                        caseNumber: 0,
                        caseEndDate: expires,
                    })
                    banExpire.save()

                    const banned = new EmbedBuilder()
                        .setDescription(`**Case:** ${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason} | **Length**: ${time1} ${type}`)
                        .setColor(color)
                    interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been banned! (Warns **${warns}**)`, embeds: [banned] })
                    let theModifier = "None"
                    if(modifier?.toLowerCase() == "-s") theModifier = "Soft Ban"
                    const modLogs = new EmbedBuilder()
                        .setAuthor({ name: `Member Banned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                        .setThumbnail(user.displayAvatarURL() || null)
                        .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                        > [${user.id}]
                        > [<@${user.id}>]
        
                        <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                        > [${interaction.user.id}]
                        > [<@${interaction.user.id}>]
        
                        <:pencil:977391492916207636> **Action:** Ban
                        > [**Case:** #${caseNumberSet}]
                        > [**Length:**] ${time1} ${type}
                        > [**Modifier:**] ${theModifier}
        
                        **Reason:** ${reason}
                        **Channel:** <#${interaction.channel?.id}>
                        **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                        .setColor(color)
                        .setTimestamp()
                    const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
                    if (!channel) { return; }
                    if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                        (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
                    }

                    if (member) {
                        if (configuration?.dmOnPunish == true) {
                            const dm = new EmbedBuilder()
                                .setAuthor({ name: "You Were Banned from " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                                .setColor(color)
                                .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                                <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                                <:blurple_bulletpoint:997346294253244529> **Length:** ${time1} ${type}`)
                                .setTimestamp()
                                if(guildProp?.premium == false) {
                                    user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                        if (!channel) { return; }
                                        if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                        }
                                    })
                                } else if (guildProp?.premium == true) {
                                    user.send({ embeds: [dm] }).catch((err: Error) => {
                                        const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                                        if (!channel) { return; }
                                        if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                            (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                                        }
                                    })
                                }
                        }
                    }

                    const newCase = new Cases({
                        guildID: interaction.guild.id,
                        userID: user.id,
                        modID: interaction.user.id,
                        caseType: "Ban",
                        caseReason: reason,
                        caseNumber: caseNumberSet,
                        caseLength: time1 + " " + type,
                        caseDate: Date.now(),
                    })
                    newCase.save().catch((err: Error) => console.error(err));

                } else {
                    return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })
                }
            } else {
                return interaction.reply({ content: "Inputted time is invalid. Ex: `1m` or `1s`" })
            }
        }

        if (!time) {
            const banned = new EmbedBuilder()
                .setDescription(`**Case:** ${caseNumberSet} | **Mod:** ${interaction.user.tag} | **Reason:** ${reason} | **Length**: Permanent`)
                .setColor(color)
            interaction.reply({ content: `<:arrow_right:967329549912248341> **${user.username}** has been banned! (Warns **${warns}**)`, embeds: [banned] })
            let theModifier = "None"
            if(modifier?.toLowerCase() == "-s") theModifier = "Soft Ban"
            const modLogs = new EmbedBuilder()
                .setAuthor({ name: `Member Banned - ${user.tag}`, iconURL: user.displayAvatarURL() || undefined })
                .setThumbnail(user.displayAvatarURL() || null)
                .setDescription(`<:user:977391493218181120> **User:** ${user.tag}
                > [${user.id}]
                > [<@${user.id}>]

                <:folder:977391492790362173> **Mod:** ${interaction.user.tag}
                > [${interaction.user.id}]
                > [<@${interaction.user.id}>]

                <:pencil:977391492916207636> **Action:** Ban
                > [**Case:** #${caseNumberSet}]
                > [**Length:**] Permanent
                > [**Modifier:** ${theModifier}]

                **Reason:** ${reason}
                **Channel:** <#${interaction.channel?.id}>
                **Date:** <t:${Math.round(Date.now() / 1000)}:D>`)
                .setColor(color)
                .setTimestamp()
            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration?.modLogChannel!);
            if (!channel) { return; }
            if (interaction.guild.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                (interaction.guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogs] })
            }

            if (member) {
                if (configuration?.dmOnPunish == true) {
                    const dm = new EmbedBuilder()
                        .setAuthor({ name: "You Were Banned from " + interaction.guild.name + "!", iconURL: interaction.guild.iconURL() || undefined })
                        .setColor(color)
                        .setDescription(`<:blurple_bulletpoint:997346294253244529> **Reason:** ${reason}
                        <:blurple_bulletpoint:997346294253244529> **Case:** #${caseNumberSet}
                        <:blurple_bulletpoint:997346294253244529> **Length:** Permanent`)
                        .setTimestamp()
                    if(guildProp?.premium == false) {
                        user.send({ embeds: [dm], components: [row] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        })
                    } else if (guildProp?.premium == true) {
                        user.send({ embeds: [dm] }).catch((err: Error) => {
                            const channel = interaction.guild?.channels.cache.find((c: any) => c.id === configuration.modLogChannel);
                            if (!channel) { return; }
                            if (interaction.guild?.members.me?.permissionsIn(channel).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
                                (interaction.guild?.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ content: "Unable to DM User." })
                            }
                        })
                    }
                }
            }

            const newCase = new Cases({
                guildID: interaction.guild.id,
                userID: user.id,
                modID: interaction.user.id,
                caseType: "Ban",
                caseReason: reason,
                caseNumber: caseNumberSet,
                caseLength: "Permanent",
                caseDate: Date.now(),
            })
            newCase.save().catch((err: Error) => console.error(err));
        }
        if(modifier?.toLocaleLowerCase() == "-s") deleteDays = 7
        interaction.guild.members.ban(user.id, {reason: reason, deleteMessageDays: deleteDays})
        //member?.ban({ reason: reason, deleteMessageDays: deleteDays })
        if(modifier?.toLocaleLowerCase() == "-s") {
            await interaction.guild.members.unban(user.id as UserResolvable).catch((err: Error) => console.error(err))
        }
    }
}
function endsWithAny(suffixes: any, string: string) {
    return suffixes.some(function (suffix: any) {
        return string.endsWith(suffix);
    });
}