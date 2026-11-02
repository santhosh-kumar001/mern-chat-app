const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['admin', 'moderator', 'user', 'guest'] 
  },
  permissions: [{ type: String }] // e.g., ["send_message", "delete_message", "upload_files"]
});

module.exports = mongoose.model('Role', RoleSchema);