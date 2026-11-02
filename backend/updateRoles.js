const mongoose = require('mongoose');
const Role = require('./models/Role'); 

mongoose.connect('mongodb://127.0.0.1:27017/chatapp');

const roles = [
    {
        name: 'admin',
        permissions: ['send_message', 'delete_message', 'edit_message', 'ban_user', 'mute_user', 'upload_files', 'create_room']
    },
    {
        name: 'moderator',
        permissions: ['send_message', 'delete_message', 'edit_message', 'ban_user', 'mute_user', 'upload_files']
    },
    {
        name: 'user',
        permissions: ['send_message', 'edit_message', 'upload_files']
    },
    {
        name: 'guest',
        permissions: [] 
    }
];

const seedDB = async () => {
    await Role.deleteMany({});
    await Role.insertMany(roles);
    console.log("✅ Roles & Permissions Database Updated!");
    process.exit();
};
seedDB();