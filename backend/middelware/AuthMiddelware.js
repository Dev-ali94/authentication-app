const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, login again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.user = { id: tokenDecode.id };
      next();
    } else {
      res.json({ success: false, message: "Login Again" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports = userAuth;
