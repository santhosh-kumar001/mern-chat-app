const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // This links the User to the Role collection
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' } 
});

module.exports = mongoose.model('User', UserSchema);