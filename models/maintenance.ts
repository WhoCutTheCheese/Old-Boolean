import mongoose from 'mongoose'

let Schema = new mongoose.Schema({
    botID: String,
    maintenance: Boolean,
    maintainDetails: String,
})

export default mongoose.model('maintenance', Schema);