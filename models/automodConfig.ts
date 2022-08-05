import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    guildID: String,
    blockLinks: Boolean,
    blockSlurs: Boolean,
    blockScams: Boolean,
    filter: Boolean,
    slurList: Array,
    bannedWordsList: Array,
    websiteWhitelist: Array,
})

export = mongoose.model('automod', Schema)
