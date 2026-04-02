const Message = require("../models/Message");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, receivers, message, type = 'general' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    // For announcements, allow sending to multiple receivers
    if (type === 'announcement') {
      if (!receivers || !Array.isArray(receivers) || receivers.length === 0) {
        return res.status(400).json({ success: false, message: 'Receivers array is required for announcements' });
      }
      
      // Validate all receivers exist
      const receiverUsers = await User.find({ _id: { $in: receivers } });
      if (receiverUsers.length !== receivers.length) {
        return res.status(400).json({ success: false, message: 'Some receivers are invalid' });
      }
      
      // Create messages for all receivers
      const messages = [];
      for (const rec of receivers) {
        const msg = await Message.create({
          sender: req.user._id,
          receiver: rec,
          message: message.trim(),
          type,
        });
        messages.push(msg);
        
        // Emit via socket
        req.app.get('io').to(rec).emit('message', {
          _id: msg._id,
          sender: { _id: req.user._id, name: req.user.name, email: req.user.email },
          receiver: { _id: rec, name: receiverUsers.find(u => u._id.toString() === rec).name, email: receiverUsers.find(u => u._id.toString() === rec).email },
          message: msg.message,
          type: msg.type,
          createdAt: msg.createdAt
        });
      }
      
      return res.status(201).json({ success: true, messages, count: messages.length });
    }
    
    // Single message logic
    if (!receiver) {
      return res.status(400).json({ success: false, message: 'Receiver is required' });
    }

    // Validate receiver exists (allow any user, not just students)
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(400).json({ success: false, message: 'Invalid receiver' });
    }

    const msg = await Message.create({
      sender: req.user._id,
      receiver,
      message: message.trim(),
      type,
    });

    // Emit via socket
    req.app.get('io').to(receiver).emit('message', {
      _id: msg._id,
      sender: { _id: req.user._id, name: req.user.name, email: req.user.email },
      receiver: { _id: receiver, name: receiverUser.name, email: receiverUser.email },
      message: msg.message,
      type: msg.type,
      createdAt: msg.createdAt
    });

    res.status(201).json({ success: true, msg });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendAnnouncement = async (req, res) => {
  try {
    const { message, targetRole } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    if (!targetRole || !['student', 'mentor', 'admin', 'all'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Valid targetRole is required (student, mentor, admin, all)' });
    }
    
    // Get all users matching the target role
    let query = {};
    if (targetRole === 'all') {
      query = {};
    } else {
      query = { role: targetRole };
    }
    
    const targetUsers = await User.find(query).select('_id');
    if (targetUsers.length === 0) {
      return res.status(400).json({ success: false, message: 'No users found for the target role' });
    }
    
    const receivers = targetUsers.map(user => user._id);
    
    // Use the existing sendMessage logic for announcements
    req.body = {
      receivers,
      message: message.trim(),
      type: 'announcement'
    };
    
    return exports.sendMessage(req, res);
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: -1 })
    .limit(50); // Limit to prevent large responses

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};