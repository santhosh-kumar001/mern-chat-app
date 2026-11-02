const mongoose = require('mongoose');
const Role = require('./models/Role');

mongoose.connect('mongodb://127.0.0.1:27017/chatapp');

const seedRoles = async () => {
  const roles = [
    {
      name: 'admin',
      permissions: ['send_message', 'delete_message', 'edit_message', 'upload_files', 'ban_user', 'manage_roles']
    },
    {
      name: 'moderator',
      permissions: ['send_message', 'delete_message', 'upload_files', 'mute_user']
    },
    {
      name: 'user',
      permissions: ['send_message', 'upload_files']
    },
    {
      name: 'guest',
      permissions: ['send_message'] // Limited permissions
    }
  ];

  try {
    await Role.deleteMany({}); // Clear existing roles
    await Role.insertMany(roles);
    console.log("✅ Roles seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedRoles();