exports.passwordResetHandler = async (req, res) => {
  try {
    // Step 1: Initial request - just email (send OTP)
    if (!req.body.otp && !req.body.newPassword) {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const user = await User.findOne({ email });
      
      // Security: Return same message whether user exists or not
      const message = 'If this email exists, a reset OTP has been sent';
      if (!user) {
        return res.status(200).json({
          success: true,
          message
        });
      }

      const otp = await user.createPasswordResetOTP();
      console.log('Generated OTP:', otp);
      await sendPasswordResetEmail(user.email, otp);

      // Set secure httpOnly cookie with email
      res.cookie('resetEmail', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message
      });
    }

    // Step 2: Verify OTP (email from cookie)
    if (req.body.otp && !req.body.newPassword) {
      const { otp } = req.body;
      const email = req.cookies.resetEmail;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: 'OTP is required'
        });
      }

      const user = await User.findOne({
        email,
        passwordResetOTP: otp,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired OTP'
        });
      }

      // Set verification token in cookie
      res.cookie('otpVerified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    // Step 3: Reset password (email from cookie, verification check)
    if (req.body.newPassword) {
      const { newPassword } = req.body;
      const email = req.cookies.resetEmail;
      const isVerified = req.cookies.otpVerified === 'true';

      if (!email || !isVerified) {
        return res.status(400).json({
          success: false,
          error: 'OTP verification required'
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password is required'
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request'
        });
      }

      user.password = newPassword;
      user.passwordResetOTP = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Clear cookies
      res.clearCookie('resetEmail');
      res.clearCookie('otpVerified');

      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid request'
    });

  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({
      success: false,
      error: 'Password reset failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};