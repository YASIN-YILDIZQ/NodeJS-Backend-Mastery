const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {Text: String, unique: true,required: true},
    password: {Text: String, required: true},
    is_active: {Text: Boolean, default: true},
    phone_number: String,
    created_by:Object.Schema.Types.ObjectId
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('Users', userSchema)