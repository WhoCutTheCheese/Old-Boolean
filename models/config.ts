  
import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    muteRoleID: String,
    modLogChannel: String,
    joinRoleID: String,
    modRoleID: Array,
    adminRoleID: Array,
})

module.exports = mongoose.model('config', Schema)