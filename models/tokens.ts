import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    userID: String,
    userName: String,
    tokens: Number,
})
export default mongoose.model('tokens', Schema)