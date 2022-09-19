import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    premium: Boolean,
    premiumHolder: String,
    totalCases: Number,
})

export default mongoose.model('guild', Schema);