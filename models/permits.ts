import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    permitName: String,
    roles: Array,
    users: Array,
    commandAccess: Array,
    commandBlocked: Array,
    commandBypass: Array,
    autoModBypass: Boolean,
})

export default mongoose.model('permits', Schema);