const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user and ATTACH their Role data
        const user = await User.findOne({ email: email.toLowerCase() }).populate('role');
        
        if (!user) return res.status(400).json({ message: "User not found" });

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 3. Create Token
        const token = jwt.sign(
            { id: user._id, role: user.role.name }, 
            'YOUR_JWT_SECRET', 
            { expiresIn: '1h' }
        );

        // 4. Send back user info + role name + permissions
        res.json({
            token,
            user: {
                username: user.username,
                role: user.role.name, // "admin", "moderator", etc.
                permissions: user.role.permissions // ["send_message", "delete_message", etc.]
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});