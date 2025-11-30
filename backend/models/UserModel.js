const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")

const userScheme = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: "",
  },
  expireOtp: {
    type: Date,
    default: 0,
  },
   otpSendCount: {
    type: Number,
    default: 0, // how many OTPs sent today
  },
  lastOtpSent: {
    type: Date,
    default: null, // last time OTP was sent
  },
    forgetPasswordOtp: {
    type: String,
    default: "",
  },
  expireForgetPasswordOtp: {
    type: Date,
    default: 0,
  },
})
module.exports = mongoose.model("User", userScheme)