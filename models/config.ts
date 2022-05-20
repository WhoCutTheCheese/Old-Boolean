  
import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    muteRoleID: String,
    modLogChannel: String,
    joinRoleID: String,
})

module.exports = mongoose.model('config', Schema)