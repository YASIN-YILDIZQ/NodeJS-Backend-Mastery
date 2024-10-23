const  mongoose = require('mongoose');
const  userRoleSchema = new mongoose.Schema({
    user_id: Object.Schema.Types.ObjectId,
    role_id: Object.Schema.Types.ObjectId
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('UserRoles', userRoleSchema)