const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};