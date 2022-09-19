import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    guildID: String,
    userID: String,
    modID: String,
    caseType: String,
    caseReason: String,
    caseNumber: String,
    caseLength: String,
    caseDate: String,
})

export default mongoose.model('cases', Schema)
