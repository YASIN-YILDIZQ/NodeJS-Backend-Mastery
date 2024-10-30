const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, unique: true,required: true},
    password: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    phone_number: {type: String},
    created_by:{type:mongoose.SchemaTypes.ObjectId}
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('Users', userSchema)