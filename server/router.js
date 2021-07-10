const express = require("express");
// creation of the router object
const router = express.Router();
const { sendMemberCounts } = require("./configController");
router.get("./config/memberCounts", sendMemberCounts);

module.exports = router;
