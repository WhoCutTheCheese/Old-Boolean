import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    guildID: String,
    prefix: String,
    color: String,
    premium: Boolean,
    premiumHolder: String,
    totalCases: Number,
})

export = mongoose.model('guild', Schema)