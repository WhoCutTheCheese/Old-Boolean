import { Client, Message } from "discord.js";
import Maintenance from "../../models/maintenance";

module.exports = {
    commands: ['maintenance'],
    minArgs: 1,
    expectedArgs: "[Reason/Enable/Disable/Createfile] (Reason)",
    devOnly: true,
    callback: async (client: Client, message: Message, args: string[]) => {

        const maintenance = await Maintenance.findOne({
            botID: client.user?.id
        })

        switch (args[0].toLowerCase()) {
            case "reason":

                if(!maintenance) return message.channel.send({ content: "You must make a file!" });

                if(maintenance?.maintenance == false) return message.channel.send({ content: "No maintenance enabled." })
                if(!args[1]) return message.channel.send({ content: "No reason provided!" })

                await Maintenance.findOneAndUpdate({
                    botID: client.user?.id,
                }, {
                    maintainDetails: args.splice(1).join(" ")
                })

                message.channel.send({ content: `Current maintenance reason set to: \`${args.splice(1).join(" ")}\`` })

                break;
            case "enable":

                if(!maintenance) return message.channel.send({ content: "You must make a file!" });

                if(maintenance?.maintenance == true) return message.channel.send({ content: "Maintenance is already enabled." })
                let reason = args.splice(1).join(" ");
                if(!reason) reason = "No reason provided. Likely an emergency maintenance."

                await Maintenance.findOneAndUpdate({
                    botID: client.user?.id,
                }, {
                    maintenance: true,
                    maintainDetails: reason
                })

                message.channel.send({ content: `Enabled maintenance under the reason: \`${reason}\`` })

                break;
            case "disable":

                if(!maintenance) return message.channel.send({ content: "You must make a file!" });

                if(maintenance?.maintenance == false) return message.channel.send({ content: "Maintenance is already disabled." })

                await Maintenance.findOneAndUpdate({
                    botID: client.user?.id,
                }, {
                    maintenance: false,
                    maintainDetails: "None"
                })

                message.channel.send({ content: `Maintenance has been disabled.` })

                break;
            case "createfile":

                if(maintenance) return message.channel.send({ content: "File already exists." })

                const newMaintananceFile = new Maintenance({
                    botID: client.user?.id,
                    maintenance: false,
                    maintainDetails: "None",
                })
                newMaintananceFile.save().catch((err: Error) => console.error(err));

                message.channel.send({ content: "File created." })

                break;
        }

    },
}