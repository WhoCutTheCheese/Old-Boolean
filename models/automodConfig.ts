import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    guildID: String,
    blockLinks: Boolean,
    blockScams: Boolean,
    massMentions: Boolean,
    maxMentions: Number,
    websiteWhitelist: Array,
})

export = mongoose.model('automod', Schema)
