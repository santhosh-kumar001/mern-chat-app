const express = require('express');
const router = express.Router();
const checkPermission = require('../middleware/checkPermission');
const verifyToken = require('../middleware/authMiddleware'); // Your JWT protector
const Message = require('../models/Message');

// 1. DELETE MESSAGE (Admin/Moderator only)
router.delete('/message/:id', verifyToken, checkPermission('delete_message'), async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting message" });
    }
});

// 2. UPLOAD FILE (Everyone except Guests)
router.post('/upload', verifyToken, checkPermission('upload_files'), (req, res) => {
    // This is where your Multer logic goes
    res.status(200).json({ message: "File uploaded successfully" });
});

module.exports = router;