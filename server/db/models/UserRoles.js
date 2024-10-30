const  mongoose = require('mongoose');
const  userRoleSchema = new mongoose.Schema({
    user_id: {type:mongoose.SchemaTypes.ObjectId},
    role_id: {type:mongoose.SchemaTypes.ObjectId}
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('UserRoles', userRoleSchema)