const router = require("express").Router();
const c = require("../controllers/NotificationController");

router.get("/", c.getNotifications);
router.put("/:id/read", c.markRead);

module.exports = router;