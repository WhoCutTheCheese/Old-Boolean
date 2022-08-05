import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    blockLinks: Boolean,
    blockSlurs: Boolean,
    bannedWordsList: Array,
})

export = mongoose.model('automod', Schema)
