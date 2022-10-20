import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    prefix: String,
    muteRoleID: String,
    modLogChannel: String,
    joinRoleID: String,
    embedColor: String,
    dmOnPunish: Boolean,
    modRoleID: Array,
    adminRoleID: Array,
    warnsBeforeMute: Number,
    deleteCommandUsage: Boolean,
})

export default mongoose.model('config', Schema);