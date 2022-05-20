import Discord from 'discord.js';
const Guild = require("../../models/guild");
module.exports = {
    commands: ['serverinfo', 'sinfo', 'server-info', 'si'],
    minArgs: 0,
    maxArgs: 0,
    callback: async (client: Discord.Client, bot: string, message: any, args: string[]) => {
        const gSettings = await Guild.findOne({
            guildID: message.guild.id
        })
        message.guild.members.fetch().then((fetchedMembers: any) => {
            const totalMembers = fetchedMembers

            function checkDays(date: any) {
                let now = new Date();
                let diff = now.getTime() - date.getTime();
                let days = Math.floor(diff / 86400000);
                return days + (days == 1 ? " day" : " days") + " ago";
            };
            let verifLevel
            if (message.guild.verificationLevel == "NONE") { verifLevel = "None" }
            if (message.guild.verificationLevel == "LOW") { verifLevel = "Low" }
            if (message.guild.verificationLevel == "MEDIUM") { verifLevel = "Medium" }
            if (message.guild.verificationLevel == "HIGH") { verifLevel =  "(╯°□°）╯︵  ┻━┻" }
            if (message.guild.verificationLevel == "VERY_HIGH") { verifLevel =  "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻" }
            const botCount = message.guild.members.cache.filter((member: any) => !member.user.bot).size;
            const botCount2 = message.guild.members.cache.filter((member: any) => member.user.bot).size;
            const serverinfo = new Discord.MessageEmbed()
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({dynamic : true}) })
                .setThumbnail(message.guild.iconURL({dynamic : true}))
                .setColor(gSettings.color)
                .addField("Name", message.guild.name, true)
                .addField("ID", message.guild.id, true)
                .addField("Owner", `<@${message.guild.ownerId}>`, true)
                .addField("Members", `**${totalMembers.size}** total members,\n**${botCount}** total humans,\n**${botCount2}** total bots`)
                .addField("Emojis", `${message.guild.emojis.cache.size}`, true)
                .addField("Channels", `${message.guild.channels.cache.size}`, true)
                .addField("Roles", `${message.guild.roles.cache.size}`, true)
                .addField("Verification Level", `${verifLevel}`, true)
                .addField("Creation Date", `<t:${Math.floor(message.channel.guild.createdAt.getTime() / 1000)}:D> (<t:${Math.floor(message.channel.guild.createdAt.getTime() / 1000)}:R>)`, true)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL({dynamic : true}) })
                message.channel.send({ embeds: [serverinfo] })
        });

    }
}