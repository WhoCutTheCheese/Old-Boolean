import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, Interaction, ButtonInteraction } from "discord.js";
import Guild from "../../models/guild";
import ErrorLog from "../../functions/errorlog";
import Config from "../../models/config";
module.exports = {
    commands: ['modroleset', 'setmodrole'],
    expectedArgs: "[Sub Command] (@Role || Sub Command)",
    cooldown: 2,
    staffPart: "Admin",
    userPermissions: ["ADMINISTRATOR"],
    callback: async (client: Client, bot: any, message: Message, args: string[]) => {
        try {
            const guildSettings = await Guild.findOne({
                guildID: message.guild?.id,
            })
            const configSettings = await Config.findOne({
                guildID: message.guild?.id,
            })
            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel("CONFIRM")
                    .setStyle("DANGER")
                    .setCustomId(`CONFIRM.${message.author.id}`)
                    .setEmoji("⛔")
            )

            switch (args[0]) {
                case "reset":
                    const areYouSureEmbed = new MessageEmbed()
                        .setTitle("Are you sure?")
                        .setDescription("Are you sure you want to reset all Mod roles?")
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [areYouSureEmbed], components: [row] }).then((resultMessage: any) => {
                        const filter = (Interaction: Interaction) => {
                            if (Interaction.user.id === message.author.id) return true;
                        }
                        const Buttoncollector = resultMessage.createMessageComponentCollector({
                            filter,
                            time: 15000
                        })

                        Buttoncollector.on('collect', async (i: ButtonInteraction) => {
                            await i.deferUpdate()
                            const id = i.customId
                            if (id === `CONFIRM.${i.user.id}`) {
                                row.components[0].setDisabled(true)
                                const deleteallcasesEmbed = new MessageEmbed()
                                    .setTitle("Are you sure?")
                                    .setDescription("Are you sure you want to reset all Mod roles?")
                                    .setColor(guildSettings.color)
                                resultMessage.edit({ embeds: [areYouSureEmbed], components: [row] }).catch((err: Error) => ErrorLog(message.guild!, "EDIT_FUNCTION", err, client, message, `${message.author.id}`, `modroleset.ts`))
                                await Config.findOneAndUpdate({
                                    guildID: message.guild?.id,
                                }, {
                                    modRoleID: []
                                })
                            }
                        })
                    }).catch((err: Error) => ErrorLog(message.guild!, "EDIT_MESSAGE", err, client, message, `${message.author.id}`, `modroleset.ts`))
                    break;
                case "view":
                    let adminRole
                    if (configSettings.modRoleID.length === 0) { adminRole = "None" }
                    if (configSettings.modRoleID.length > 0) {
                        adminRole = []
                        for (const adminRoles of configSettings.modRoleID) {
                            adminRole.push(` <@&${adminRoles}>`)
                        }
                    }
                    const viewAdminRoles = new MessageEmbed()
                        .setAuthor({ name: "Current Mod Roles", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`**Admin Roles:**
                        [${adminRole}]`)
                        .setColor(guildSettings.color)
                    message.channel.send({ embeds: [viewAdminRoles] })
                    break;
                case "add":
                    if(!args[1]) {
                        return message.channel.send({ content: "You need to supply a role ID or @" });
                    }
                    const role = message.guild?.roles.cache.get(args[1]) || message.mentions.roles.first();
                    if(!role) {
                        return message.channel.send({ content: "Invalid Role" })
                    }
                    if(configSettings.modRoleID.includes(role.id)) {
                        return message.channel.send({ content: "This role is already defined as an Mod." })
                    }
                    if(configSettings.modRoleID.length === 5) {
                        return message.channel.send("You've reached your maxiumum allowed Mod roles.")
                    }
                    await Config.findOneAndUpdate({
                        guildID: message.guild?.id,
                    }, {
                        $push: {modRoleID: role.id}
                    })
                    message.channel.send(`You've successfully added **${role.name}** as an Mod role.`)
                    break;
                default:
                    const defaultEmbed = new MessageEmbed()
                        .setColor(guildSettings.color)
                        .setAuthor({ name: "Set Boolean's Mod Role", iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                        .setDescription(`Mod roles get access to the most basic of moderation commands, such as !!warn and !!mute.
                        
                        **__Sub Commands:__**
                        > **Reset:** [Delete all current Mod roles.]
                        > **View:** [View all current Mod roles]
                        > **Add:** [Add an Mod role (Maximum: 5)]`)
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) || "" })
                    message.channel.send({ embeds: [defaultEmbed] })
            }

        } catch {
            (err: Error) => {
                ErrorLog(message.guild!, "MOD_ROLE_SET_COMMAND", err, client, message, `${message.author.id}`, `modroleset.ts`)
            }
        }
    },
}