const express = require('express');
const userAuth = require('../middelware/AuthMiddelware.js')
const UserController = require('../controller/AuthController.js')
const router = express.Router();

router.post("/register", UserController.registration)
router.post("/verify", userAuth, UserController.verification)
router.post("/resend-otp", userAuth, UserController.resendOTP)
router.get("/auth",userAuth ,UserController.isAuthenticated)
router.post("/forget-password", UserController.forgetPassword)
router.post("/reset-password", UserController.resetpassword)
router.post("/login", UserController.login)
router.post("/logout", UserController.logout)

module.exports = router