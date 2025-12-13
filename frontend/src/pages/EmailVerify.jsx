import React, { useState, useContext, useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { AppContext } from "../context/AppContext"
import { useNavigate } from "react-router-dom"

const EmailVerify = () => {
  const navigate = useNavigate()
  const [counter, setCounter] = useState(30)
  const [loading, setLoading] = useState(false)
  const { backendUrl, getUserData, userData } = useContext(AppContext)

  const inputRefs = React.useRef([])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Auto-navigate if already verified
  useEffect(() => {
    if (userData?.verified) {
      navigate("/")
    }
  }, [userData, navigate])

  const handleInput = (e, index) => {
    const value = e.target.value
    
    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      e.target.value = ''
      return
    }
    
    if (value.length > 0 && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text").trim()
    
    // Extract only numbers
    const numbers = paste.replace(/\D/g, '').slice(0, 6)
    
    numbers.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })
    
    // Focus next empty input or last one
    const nextEmptyIndex = numbers.length < 6 ? numbers.length : 5
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus()
    }
  }

  const SubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Collect OTP
    const otpArray = inputRefs.current.map((input) => input.value)
    const otp = otpArray.join('')
    
    // Validate OTP length
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      setLoading(false)
      return
    }
    
    try {
      axios.defaults.withCredentials = true
      
      const { data } = await axios.post(`${backendUrl}/api/auth/verify`, {
        otp
      })
      
      if (data.success) {
        toast.success(data.message)
        await getUserData() 
        navigate("/")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (counter > 0) return
    
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(`${backendUrl}/api/auth/resend-otp`)
      
      if (data.success) {
        toast.success(data.message)
        setCounter(30)
        
        // Clear OTP inputs
        inputRefs.current.forEach(input => input.value = '')
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus()
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Counter timer
  useEffect(() => {
    if (counter <= 0) return
    
    const timer = setTimeout(() => setCounter(counter - 1), 1000)
    return () => clearTimeout(timer)
  }, [counter])

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="bg-gray-950/65 p-10 rounded-xl shadow-lg w-full sm:w-96">
        <h2 className="text-center text-2xl font-bold text-white mb-2">
          Verify Your Email
        </h2>
        
        <p className="text-center text-sm font-medium text-indigo-400 mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-blue-400">
            {userData?.email || "your email"}
          </span>
        </p>

        <form onSubmit={SubmitHandler}>
          <div 
            className="flex justify-between mb-8" 
            onPaste={handlePaste}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 text-center text-white text-xl rounded-lg bg-gray-900/70 focus:ring-2 focus:ring-indigo-500 outline-none border border-gray-700 hover:border-indigo-500 transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-900 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center mt-4">
            {counter > 0 ? (
              <p className="text-sm text-gray-300">
                Resend OTP in{" "}
                <span className="text-blue-400 font-medium">
                  {counter}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-400 font-semibold hover:text-blue-300 transition"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailVerify