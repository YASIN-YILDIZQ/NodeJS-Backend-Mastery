const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;
const  roleSchema = new Schema({
    role_name: String,
    is_active: Boolean,
    created_by:Object.Schema.Types.ObjectId,
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('Roles', roleSchema)