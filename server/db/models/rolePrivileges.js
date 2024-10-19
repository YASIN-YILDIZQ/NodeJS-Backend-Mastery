const  mongoose = require('mongoose');
const  rolePrivilegeSchema = new mongoose.Schema({
    role_id: Object.Schema.Types.ObjectId,
    permission:String,
    created_by:Object.Schema.Types.ObjectId
  
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('RolePrivilegeSchema', rolePrivilegeSchema)