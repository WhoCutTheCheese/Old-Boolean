import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    guildSettings: {
        prefix: String,
        premium: Boolean,
        premiumHolder: String,
        totalCases: Number,
        joinRole: String,
        embedColor: String,       
    },
    modSettings: {
        muteRole: String,
        modLogChannel: String,
        dmOnPunish: Boolean,
        warnsBeforeMute: Number,
        deleteCommandUsage: Boolean,
    },
    autoModSettings: {
        blockLinks: Boolean,
        blockInvites: Boolean,
        blockScams: Boolean,
        massMentions: Boolean,
        maxMentions: Number,
        websiteWhitelist: Array,
    }
})

export default mongoose.model('settings', Schema);