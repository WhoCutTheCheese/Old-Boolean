  
import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    muteRoleID: String,
    modLogChannel: String,
    joinRoleID: String,
    dmOnPunish: Boolean,
    modRoleID: Array,
    adminRoleID: Array,
})

export = mongoose.model('config', Schema)