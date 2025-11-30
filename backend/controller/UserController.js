const  User =require('../models/UserModel')

exports.getUserData = async (req, res) => {
  try {
    const userId = req.userId; // ✅ get from middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("getUserData error:", error.message);
    res.json({ error: "Error fetching user data, please try again" });
  }
};
