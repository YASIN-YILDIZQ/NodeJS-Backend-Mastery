const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    is_active: Boolean,
    created_by:Object.Schema.Types.ObjectId,
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('Categories', categorySchema)