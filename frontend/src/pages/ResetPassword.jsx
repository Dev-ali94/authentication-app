import React, { useState,useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ResetPassword = () => {
  const navigate =useNavigate()
  const [email,setEmail]=useState('')
  const [isEmailSent,setIsEmailSent]=useState('')
  const [otp,setOtp]=useState(0)
  const [isOtpSubmited,setIsOtpSubmited]=useState(false)
  const[newPassword,setNewPasssword] =useState('')
    const { backendUrl, setIsLoggedIn, getUserData, userData } =
      useContext(AppContext);
       axios.defaults.withCredentials = true;
        const inputRefs = React.useRef([]);
      
        const handelInput = async (e, index) => {
          if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
          }
        };
      
        const handelKeyDown = async (e, index) => {
          if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            inputRefs.current[index - 1].focus();
          }
        };
      
        const handelPaste = (e) => {
          const paste = e.clipboardData.getData("text");
          const pasteArray = paste.split("");
          pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
              inputRefs.current[index].value = char;
            }
          });
        };
        const onSubmitEmail = async (e) => {
  e.preventDefault();
  try {
    const { data } = await axios.post(`${backendUrl}/api/auth/forget-password`, {email});
    data.success ? toast.success(data.message) :toast.error(data.message)
    data.success && setIsEmailSent(true)
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};
const onSubmitOtp = async (e) => {
    e.preventDefault(); // ✅ prevent form reload
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""))
    setIsOtpSubmited(true)
  };
  const onSbmitNewPassword =async (e) => {
    e.preventDefault()
    try {
    const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {email,newPassword,otp});
    data.success ? toast.success(data.message) :toast.error(data.message)
    data.success &&  navigate('/login')
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
  }
      
  return (
    <div>
     <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
       {/*Enter Email */}
       {!isEmailSent &&
        <form 
        onSubmit={onSubmitEmail}
          className="bg-gray-950/65 p-10 rounded-xl shadow-lg w-full sm:w-96"
        >
           <h2 className="text-center text-2xl font-bold text-white mb-2">
          Reset Password
          </h2>

          {/* Fixed safe access */}
          <p className="text-center text-sm font-medium text-indigo-400 mb-6">
          Enter your register email address
          </p>
 <div className="flex items-center mb-5 gap-3 px-4 py-2.5 rounded-full w-full bg-gray-900/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
            <img
              src={assets.mail_icon}
              alt=""
              className="w-5 h-5 opacity-80"
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Id"
              className="flex-1 outline-none bg-transparent text-white placeholder-gray-400 text-sm"
            />
          </div>
           <button
            type="submit"
            className="w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-900"
          >
          Submit
          </button>
        </form>
         }
       {/*password reset otp */}
       {!isOtpSubmited && isEmailSent &&
        <form
          onSubmit={onSubmitOtp}
          className="bg-gray-950/65 p-10 rounded-xl shadow-lg w-full sm:w-96"
        >
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            Verify OTP
          </h2>

          {/* Fixed safe access */}
          <p className="text-center text-sm font-medium text-indigo-400 mb-6">
            Enter 6 digit code sent to{" "}
            <span className="font-semibold text-blue-400">
              {userData?.email || "your email"}
            </span>
          </p>

          <div className="flex justify-between mb-8" onPaste={handelPaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handelInput(e, index)}
                  onKeyDown={(e) => handelKeyDown(e, index)}
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 text-center text-white text-xl rounded-lg bg-gray-900/70 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-950 transition-all"
          >
            verify email
          </button>
        </form>
        }
         {/*Enter Email */}
         {isOtpSubmited && isEmailSent &&
        <form
        onSubmit={onSbmitNewPassword}
          className="bg-gray-950/65 p-10 rounded-xl shadow-lg w-full sm:w-96"
        >
           <h2 className="text-center text-2xl font-bold text-white mb-2">
          New Password
          </h2>

          {/* Fixed safe access */}
          <p className="text-center text-sm font-medium text-indigo-400 mb-6">
          Enter your New password below
          </p>
 <div className="flex items-center mb-5 gap-3 px-4 py-2.5 rounded-full w-full bg-gray-900/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
            <img
              src={assets.mail_icon}
              alt=""
              className="w-5 h-5 opacity-80"
            />
            <input
              onChange={(e) => setNewPasssword(e.target.value)}
              value={newPassword}
              type="password"
              placeholder="password"
              className="flex-1 outline-none bg-transparent text-white placeholder-gray-400 text-sm"
            />
          </div>
           <button
            type="submit"
            className="w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-900"
          >
          Submit
          </button>
        </form>
        }
      </div>
    </div>
  )
}

export default ResetPassword
