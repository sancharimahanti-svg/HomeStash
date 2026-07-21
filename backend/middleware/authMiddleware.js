const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in request headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // 2. Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user from token and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    // 5. Move to the next function
    next();

  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };