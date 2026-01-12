const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    if (decode.userId) {
      req.userId = decode.userId;
      next();
    } else {
      return res.status(403).json({
        message: "invalid token",
      });
    }
  } catch (err) {
    return res.status(403).json({
      message: err.message,
    });
  }
};
module.exports = authMiddleware;
