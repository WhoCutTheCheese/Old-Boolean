  
import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    guildID: String,
    userID: String,
    modID: String,
    caseType: String,
    caseReason: String,
    caseNumber: String,
    caseLength: String,
})

module.exports = mongoose.model('cases', Schema)