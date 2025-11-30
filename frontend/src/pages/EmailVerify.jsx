import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(30);
  const { backendUrl, setIsLoggedIn, getUserData, userData } =
    useContext(AppContext);

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

  const SubmitHandler = async (e) => {
    e.preventDefault(); // ✅ prevent form reload
    axios.defaults.withCredentials = true;
    const otpArray = inputRefs.current.map((e) => e.value);
    const otp = otpArray.join("");
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify`, {
        otp,
      });
      if (data.success) {
        toast.success(data.message);
        await getUserData(); // ✅ fetch user info right after login
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  const handelResend = async () => {
      axios.defaults.withCredentials = true;
  try {
    const { data } = await axios.post(`${backendUrl}/api/auth/resend-otp`, {
      userId: userData?._id, // ✅ send logged-in userId
    });

    if (data.success) {
      toast.success(data.message);
      setCounter(30); // ✅ restart countdown after successful resend
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  useEffect(() => {
    if (setIsLoggedIn && userData && userData.verified) {
      navigate("/");
    }
  }, [setIsLoggedIn, userData, navigate]);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <form
          onSubmit={SubmitHandler}
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
            Verify Email
          </button>

          {/* Resend OTP with counter */}
          <div className="text-center mt-4">
            {counter > 0 ? (
              <p className="text-sm text-gray-300">
                If you don’t get OTP{" "}
                <span className="text-blue-400 font-medium">
                  Resend in {counter}s
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-300">
                Didn’t get OTP?{" "}
               <button
  type="button"
  onClick={handelResend} // ✅ call API + reset counter
  className="text-blue-400 font-semibold hover:underline"
>
  Resend
</button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;

