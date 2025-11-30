const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const User = require('../models/UserModel');
const { sendOtp, sendPasswordResetEmail } = require('../services/EmailServicse');

// registartion of user
exports.registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 if (!email || !name || !password) {
  return res.json({ success: false, message: "All fields are required" });
}
const userExist = await User.findOne({ email });
if (userExist) {
  return res.json({ success: false, message: "User already exists" });
}
    // Generate OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const expireOtp = new Date(Date.now() + 10 * 60 * 1000);
    // hash password
    const hashpassword = await bcrypt.hash(password, 10)
    // Create user
    const user = new User({
      name,
      email,
      password: hashpassword,
      otp: newOtp,
      expireOtp,
      verified: false,
    });
    await user.save()
    // Send OTP to email
    await sendOtp(email, newOtp);
    // Generate token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // set response for user
    return res.json({ success: true, message: "Please check your email for OTP verification" })
  } catch (error) {
    console.error("Registration error:", error.message);
  return res.json({ success: false, message: "Registration error, please try again" });
  }
};
// verfication of email
exports.verification = async (req, res) => {
  const { userId, otp } = req.body;
  // check userid or otp
  if (!userId || !otp) {
    return res.json({ success: false, message: "User ID and OTP are required" });
  }
  try {
    // check user exist 
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    // check user otp is match by database otp
    if (!user.otp || user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    // check otp is expire or not
    if (user.expireOtp < new Date()) {
      return res.json({ success: false, message: "OTP has expired" });
    }
    // Mark user as verified
    user.verified = true;
    user.otp = "";
    user.expireOtp = null;
    await user.save();
    // set response for user
    return res.json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.json({ error: "Verification error, please try again" });
  }
};
// resend otp if otp expire 
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    // Validate userId
    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }
    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // If already verified, don’t send OTP
    if (user.verified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Restrict max 3 OTP per day
    if (user.otpSendCount >= 3 && user.lastOtpSent >= startOfDay) {
      return res.json({
        success: false,
        message: "Maximum OTP attempts reached for today",
        nextAvailable: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000), // next day
      });
    }

    // Generate fresh OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const expireOtp = new Date(Date.now() + 10 * 60 * 1000); // 10 min validity

    // Update user OTP fields
    user.otp = newOtp;
    user.expireOtp = expireOtp;
    user.otpSendCount = user.lastOtpSent >= startOfDay ? user.otpSendCount + 1 : 1;
    user.lastOtpSent = now;

    await user.save();

    // Send OTP via email (email is taken from DB, not user input)
    await sendOtp(user.email, newOtp);

    return res.json({
      success: true,
      message: "New OTP sent successfully",
      email: user.email,
      attemptsRemaining: 3 - user.otpSendCount,
    });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    res.json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};
// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // check user enter email or password 
  if (!email || !password) {
    return res.json({ success: false, message: "email and passward are required" })
  }
  try {
    // check user eamil is exist or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid eamil" });
    }
    // check user password match or not
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid pasword" });
    }
    // Generate token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // set response for user
    return res.json({
      success: true,
      message: "login sucessfuly",
    });
  } catch (error) {
    console.error("login error:", error.message);
    res.json({ error: "Login error, please try again" });
  }
}
exports.isAuthenticated=async (req,res) => {
  try {
    return res.json({success:true})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}
// User Logout
exports.logout = async (req, res) => {
  // try to remove user cookie 
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    // set response for user
    return res.json({
      success: true,
      message: "logout sucessfuly",
    });
  } catch (error) {
    console.error("logout error:", error.message);
    res.json({ error: "Logout error, please try again" });
  }
}
// forget password with otp send 
exports.forgetPassword = async (req, res) => {

  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Enter your email" })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "user not found" })
    }
    const newOtp = crypto.randomInt(100000, 999999).toString();

    user.forgetPasswordOtp = newOtp;
    user.expireForgetPasswordOtp = Date.now() + 15 * 60 * 1000;
    await user.save()
    await sendPasswordResetEmail(email, newOtp);
    return res.json({ success: true, message: "Please check your email for OTP verification" })
  } catch (error) {
    console.error("logout error:", error.message);
    res.json({ error: "Logout error, please try again" });
  }
}
// reset password and verify otp
exports.resetpassword = async (req,res) => {
  const { email,otp,newPassword } = req.body;
  if (!email||!otp||!newPassword) {
    return res.json({ success: false, message: "Enter your all field" })
  }
  try {
     const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "user not found" })
    }
    if (user.forgetPasswordOtp===""|| user.forgetPasswordOtp !== otp) {
      return res.json({ success: false, message: "invalid otp" })
    }if (user.expireForgetPasswordOtp < Date.now()) {
      return res.json({ success: false, message: "Expired otp" })
    }
    const hashpassword =await bcrypt.hash(newPassword,10)
    user.password=hashpassword
    user.forgetPasswordOtp=""
    user.expireForgetPasswordOtp=0
    await user.save()
     return res.json({ success: true, message: "Please check your email for OTP verification" })
  } catch (error) {
      console.error("logout error:", error.message);
    res.json({ error: "Logout error, please try again" });
  }
}


