import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,

        prefix: String,
        premium: Boolean,
        premiumHolder: String,
        totalCases: Number,
        joinRoleID: String,
        embedColor: String,       


        muteRoleID: String,
        modLogChannel: String,
        dmOnPunish: Boolean,
        modRoleID: Array,
        adminRoleID: Array,
        warnsBeforeMute: Number,
        deleteCommandUsage: Boolean,

})

export default mongoose.model('config', Schema);