import { Client, Guild, GuildMember, PermissionsBitField, WebhookClient } from "discord.js";
import GuildProperties from "../models/guild";
import Configuration from "../models/config";
module.exports = {
    name: "guildMemberAdd",
    once: false,
    async execute(member: GuildMember, client: Client) {
        const nonGuildMember = client.users.cache.get(member.id)
        if (nonGuildMember?.bot) { return; }
        const configSettings = await Configuration.findOne({
            guildID: member.guild.id,
        })
        if (configSettings?.joinRoleID === "None") { return; }
        if(!member.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) { return; }
        const role = member.guild.roles.cache.get(configSettings?.joinRoleID!)
        if(role?.position! > member.guild.members.me.roles.highest.position) return
        member.roles.add(configSettings?.joinRoleID!).catch((err: Error) => console.log(err))
    }
}