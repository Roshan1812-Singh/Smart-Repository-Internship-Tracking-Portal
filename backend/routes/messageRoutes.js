const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  sendAnnouncement,
} = require("../controllers/messageController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  sendMessage
);

router.post(
  "/announcement",
  protect,
  sendAnnouncement
);

router.get(
  "/",
  protect,
  getMessages
);

module.exports = router;