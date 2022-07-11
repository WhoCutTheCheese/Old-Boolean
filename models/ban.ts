  import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    guildID: String,
    userID: String,
    caseNumber: String,
    caseEndDate: Date,
})

export = mongoose.model('bans', Schema)
