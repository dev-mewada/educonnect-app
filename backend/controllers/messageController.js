const db = require('../config/db');

/**
 * Validate if communication is allowed between two user roles:
 * Admin <-> Teacher
 * Admin <-> Student
 * Teacher <-> Student
 * Disallowed: Student <-> Student, Teacher <-> Teacher
 */
function isRoleCommunicationAllowed(senderRole, receiverRole) {
  if (senderRole === 'Admin') return receiverRole === 'Teacher' || receiverRole === 'Student';
  if (senderRole === 'Teacher') return receiverRole === 'Admin' || receiverRole === 'Student';
  if (senderRole === 'Student') return receiverRole === 'Admin' || receiverRole === 'Teacher';
  return false;
}

/**
 * GET /api/messages/conversations
 * Get list of all distinct conversation threads for the authenticated user
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all users with whom the current user has exchanged messages
    const [partners] = await db.query(
      `SELECT DISTINCT 
         CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS contact_id
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?`,
      [userId, userId, userId]
    );

    if (partners.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const conversations = [];

    for (const p of partners) {
      const contactId = p.contact_id;

      // Contact details
      const [userRows] = await db.query(
        'SELECT id, name, email, role, profile_photo, status FROM users WHERE id = ?',
        [contactId]
      );
      if (userRows.length === 0) continue;
      const contact = userRows[0];

      // Last message in thread
      const [lastMsgRows] = await db.query(
        `SELECT id, sender_id, receiver_id, message, is_read, created_at
         FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, contactId, contactId, userId]
      );

      // Unread count sent by this contact to current user
      const [unreadRows] = await db.query(
        'SELECT COUNT(*) AS unread_count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
        [contactId, userId]
      );

      conversations.push({
        contactId: contact.id,
        contactName: contact.name,
        contactEmail: contact.email,
        contactRole: contact.role,
        contactPhoto: contact.profile_photo,
        lastMessage: lastMsgRows[0]?.message || '',
        lastTimestamp: lastMsgRows[0]?.created_at || null,
        lastSenderId: lastMsgRows[0]?.sender_id || null,
        unreadCount: unreadRows[0]?.unread_count || 0
      });
    }

    // Sort by latest message descending
    conversations.sort((a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0));

    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

/**
 * GET /api/messages/contacts
 * Get list of valid users that the authenticated user can message
 */
exports.getContacts = async (req, res) => {
  try {
    const user = req.user;
    let allowedRoles = [];

    if (user.role === 'Admin') {
      allowedRoles = ['Teacher', 'Student'];
    } else if (user.role === 'Teacher') {
      allowedRoles = ['Admin', 'Student'];
    } else if (user.role === 'Student') {
      allowedRoles = ['Admin', 'Teacher'];
    }

    if (allowedRoles.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const placeholders = allowedRoles.map(() => '?').join(',');
    const [rows] = await db.query(
      `SELECT id, name, email, role, profile_photo, status 
       FROM users 
       WHERE role IN (${placeholders}) AND status = 'Active' AND id != ?
       ORDER BY name ASC`,
      [...allowedRoles, user.id]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: error.message });
  }
};

/**
 * GET /api/messages/:contactId
 * Get message history with a specific contact and mark received messages as read
 */
exports.getMessagesWithContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);

    if (isNaN(contactId) || contactId === userId) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    // Verify contact exists
    const [contactRows] = await db.query(
      'SELECT id, name, email, role, profile_photo FROM users WHERE id = ?',
      [contactId]
    );
    if (contactRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    const contact = contactRows[0];

    // Check communication permissions
    if (!isRoleCommunicationAllowed(req.user.role, contact.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Messaging between ${req.user.role} and ${contact.role} is not permitted.`
      });
    }

    // Fetch conversation messages
    const [messages] = await db.query(
      `SELECT m.id, m.sender_id, m.receiver_id, m.message, m.is_read, m.created_at,
              s.name AS sender_name, s.role AS sender_role, s.profile_photo AS sender_photo,
              r.name AS receiver_name, r.role AS receiver_role
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );

    // Mark messages sent by contact to current user as read
    await db.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [contactId, userId]
    );

    return res.status(200).json({
      success: true,
      contact,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { message } = req.body;
    const recId = parseInt(req.body.receiverId || req.body.receiver_id, 10);

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    if (!recId || recId === senderId) {
      return res.status(400).json({ success: false, message: 'Invalid recipient ID' });
    }

    // Check recipient exists and is Active
    const [recRows] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [recId]
    );
    if (recRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    const receiver = recRows[0];
    if (receiver.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Cannot send message to an inactive user' });
    }

    // Validate role authorization
    if (!isRoleCommunicationAllowed(req.user.role, receiver.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Messaging between ${req.user.role} and ${receiver.role} is not permitted.`
      });
    }

    // Insert into MySQL messages
    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
      [senderId, recId, message.trim()]
    );

    // Insert notification for recipient
    const [senderRows] = await db.query('SELECT name FROM users WHERE id = ?', [senderId]);
    const senderName = senderRows[0]?.name || 'Someone';

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, 'message', 0, NOW())`,
      [
        recId,
        'New Message',
        `You received a new message from ${senderName}: "${message.trim().slice(0, 50)}${message.length > 50 ? '...' : ''}"`
      ]
    );

    const [savedMsg] = await db.query(
      `SELECT m.*, s.name AS sender_name, s.role AS sender_role, r.name AS receiver_name
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: savedMsg[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

/**
 * PATCH /api/messages/read/:contactId
 * Explicitly mark all messages from contactId as read
 */
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);

    await db.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
      [contactId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update messages', error: error.message });
  }
};
