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
// Verify OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body
    if (!otp) {
      return res.json({ 
        success: false, 
        message: "OTP is required" 
      })
    }

    // Get user from token (assuming you have auth middleware)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    
    if (!token) {
      return res.json({ 
        success: false, 
        message: "Authentication required" 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.json({ 
        success: false, 
        message: "User not found" 
      })
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.json({ 
        success: false, 
        message: "Invalid OTP" 
      })
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
      return res.json({ 
        success: false, 
        message: "OTP has expired" 
      })
    }

    // Update user as verified
    user.verified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({
      success: true,
      message: "Email verified successfully!"
    })

  } catch (error) {
    console.error("Verification error:", error.message)
    res.json({ 
      success: false, 
      message: "Verification failed" 
    })
  }
}
// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    
    if (!token) {
      return res.json({ 
        success: false, 
        message: "Authentication required" 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.json({ 
        success: false, 
        message: "User not found" 
      })
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP via email (implement your email service here)
    // sendEmail(user.email, otp)

    res.json({
      success: true,
      message: "New OTP sent to your email!"
    })

  } catch (error) {
    console.error("Resend OTP error:", error.message)
    res.json({ 
      success: false, 
      message: "Failed to resend OTP" 
    })
  }
}
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


