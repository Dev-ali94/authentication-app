
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "User is unauthorized" });
  }
 else {
      return res.json({ success: false, message: "User is unauthorized" });
    }
};

module.exports = userAuth;

