const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Role = require('./models/Role');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

app.use(cors());
app.use(express.json());

// File Upload Logic
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
    .then(() => console.log("✅ Database Connected Safely"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const roleData = await Role.findOne({ name: role.toLowerCase() });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role: roleData?._id });
        await newUser.save();
        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(500).json({ message: "Registration Failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('role');
        if (user && !user.isBanned && await bcrypt.compare(password, user.password)) {
            res.json({ user: { 
                username: user.username, 
                role: user.role?.name || 'guest', 
                permissions: user.role?.permissions || [], 
                isMuted: user.isMuted 
            }});
        } else { res.status(400).json({ message: user?.isBanned ? "BANNED" : "Invalid Login" }); }
    } catch (err) { res.status(500).json({ message: "Login Error" }); }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

// --- Socket Logic with Safety Guards ---
io.on('connection', (socket) => {
    Message.find().sort({ createdAt: -1 }).limit(50).then(m => socket.emit('loadMessages', m.reverse()));

    socket.on('chatMessage', async (data) => {
        try {
            const user = await User.findOne({ username: data.user }).populate('role');
            // Safety Check: user exists AND role exists AND permissions exist
            const canSend = user?.role?.permissions?.includes('send_message');

            if (user && canSend && !user.isMuted) {
                const newMessage = new Message({ 
                    user: data.user, 
                    text: data.text, 
                    fileUrl: data.fileUrl || null,
                    role: user.role.name 
                });
                await newMessage.save();
                io.emit('message', newMessage); 
            }
        } catch (e) { console.error("Socket Message Error:", e.message); }
    });

    socket.on('editMessage', async ({ id, newText, requester }) => {
        try {
            const user = await User.findOne({ username: requester }).populate('role');
            const msg = await Message.findById(id);
            if (!msg) return;

            const canEdit = user?.role?.permissions?.includes('edit_message') || msg.user === requester;

            if (canEdit) {
                const updated = await Message.findByIdAndUpdate(id, { text: newText, isEdited: true }, { new: true });
                io.emit('messageEdited', { id: updated._id, newText: updated.text });
            }
        } catch (e) { console.error("Edit Error:", e.message); }
    });

    socket.on('deleteMessage', async (id) => {
        try {
            await Message.findByIdAndDelete(id);
            io.emit('messageDeleted', id);
        } catch (e) { console.error("Delete Error:", e.message); }
    });

    socket.on('banUser', async (username) => {
        try {
            await User.findOneAndUpdate({ username }, { isBanned: true });
            io.emit('userBanned', username);
        } catch (e) { console.error("Ban Error:", e.message); }
    });
});

server.listen(5000, () => console.log('🚀 Bulletproof Server running on 5000'));