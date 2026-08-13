const Household = require("../models/Household");
const User = require("../models/User");

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "STASH-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new household (user becomes admin)
// @route   POST /api/household/create
const createHousehold = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Household name is required" });

    if (req.user.household) {
      return res.status(400).json({ message: "You are already part of a household" });
    }

    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await Household.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    const household = await Household.create({
      name,
      inviteCode,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await User.findByIdAndUpdate(req.user._id, {
      household: household._id,
      role: "admin",
    });

    const populated = await Household.findById(household._id).populate(
      "members.user", "name email"
    );

    res.status(201).json({ message: "Household created", household: populated });
  } catch (error) {
    console.error("Create Household Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Join household with invite code
// @route   POST /api/household/join
const joinHousehold = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: "Invite code is required" });

    if (req.user.household) {
      return res.status(400).json({ message: "You are already part of a household" });
    }

    const household = await Household.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!household) return res.status(404).json({ message: "Invalid invite code" });

    const alreadyMember = household.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: "Already a member" });

    household.members.push({ user: req.user._id, role: "member" });
    await household.save();

    await User.findByIdAndUpdate(req.user._id, {
      household: household._id,
      role: "member",
    });

    const populated = await Household.findById(household._id).populate(
      "members.user", "name email"
    );

    res.status(200).json({ message: "Joined household", household: populated });
  } catch (error) {
    console.error("Join Household Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get household details + members
// @route   GET /api/household
const getHousehold = async (req, res) => {
  try {
    if (!req.user.household) {
      return res.status(404).json({ message: "You are not part of any household" });
    }

    const household = await Household.findById(req.user.household).populate(
      "members.user", "name email createdAt"
    );

    res.status(200).json({ household });
  } catch (error) {
    console.error("Get Household Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove a member (admin only)
// @route   DELETE /api/household/members/:userId
const removeMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot remove themselves" });
    }

    const household = await Household.findById(req.user.household);
    if (!household) return res.status(404).json({ message: "Household not found" });

    household.members = household.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await household.save();

    await User.findByIdAndUpdate(req.params.userId, {
      household: null,
      role: "member",
    });

    const populated = await Household.findById(household._id).populate(
      "members.user", "name email"
    );

    res.status(200).json({ message: "Member removed", household: populated });
  } catch (error) {
    console.error("Remove Member Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Leave household (member only)
// @route   POST /api/household/leave
const leaveHousehold = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ message: "Admin cannot leave. Delete the household instead." });
    }

    const household = await Household.findById(req.user.household);
    if (!household) return res.status(404).json({ message: "Household not found" });

    household.members = household.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await household.save();

    await User.findByIdAndUpdate(req.user._id, { household: null, role: "member" });

    res.status(200).json({ message: "Left household successfully" });
  } catch (error) {
    console.error("Leave Household Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createHousehold, joinHousehold, getHousehold, removeMember, leaveHousehold };