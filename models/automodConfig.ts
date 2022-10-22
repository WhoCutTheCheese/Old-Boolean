import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    blockLinks: Boolean,
    blockInvites: Boolean,
    blockScams: Boolean,
    massMentions: Boolean,
    maxMentions: Number,
    websiteWhitelist: Array,

})

export default mongoose.model('automodConfig', Schema);