  
import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    muteRoleID: String,
    modLogChannel: String,
    joinRoleID: String,
    embedColor: String,
    dmOnPunish: Boolean,
    modRoleID: Array,
    adminRoleID: Array,
    warnsBeforeMute: Number,
})

export = mongoose.model('config', Schema)