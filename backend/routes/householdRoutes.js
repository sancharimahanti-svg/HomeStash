const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createHousehold,
  joinHousehold,
  getHousehold,
  removeMember,
  leaveHousehold,
  deleteHousehold,
} = require("../controllers/householdController");

router.use(protect);

router.post("/create", createHousehold);
router.post("/join", joinHousehold);
router.post("/leave", leaveHousehold);
router.get("/", getHousehold);
router.delete("/members/:userId", removeMember);
router.delete("/", deleteHousehold); 

module.exports = router;