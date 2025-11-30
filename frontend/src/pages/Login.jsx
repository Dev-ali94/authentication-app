import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

const onSubmitHandler = async (e) => {
  e.preventDefault();
  try {
    axios.defaults.withCredentials = true;
    let data;
    if (state === "Sign Up") {
      ({ data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
      }));
    } else {
      ({ data } = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      }));
    }

    if (data.success) {
      setIsLoggedIn(true);
      await getUserData(); // ✅ fetch user info right after login
      navigate("/verify-email");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="bg-gray-950/65 p-10 rounded-xl shadow-lg w-full sm:w-96">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          {state === 'Sign Up'
            ? 'Create account'
            : 'Login in to your account!'}
        </h2>

        {/* ✅ removed stray form attribute */}
        <form onSubmit={onSubmitHandler} className="flex flex-col space-y-4">
          {state === 'Sign Up' && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full w-full bg-gray-900/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <img
                src={assets.person_icon}
                alt=""
                className="w-5 h-5 opacity-80"
              />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                className="flex-1 outline-none bg-transparent text-white placeholder-gray-400 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full w-full bg-gray-900/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
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

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full w-full bg-gray-900/70 focus-within:ring-2 focus-within:ring-indigo-500 transition">
            <img
              src={assets.lock_icon}
              alt=""
              className="w-5 h-5 opacity-80"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="flex-1 outline-none bg-transparent text-white placeholder-gray-400 text-sm"
            />
          </div>

          <p
            onClick={() => navigate('/reset-password')}
            className="text-white text-sm font-medium cursor-pointer"
          >
            Forget Password?
          </p>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-indigo-500 to-indigo-900"
          >
            {state}
          </button>

          {state === 'Sign Up' ? (
            <p className="mb-2 text-center font-medium text-sm text-white">
              Already have an account?{' '}
              <span
                onClick={() => setState('Login')}
                className="text-sm font-bold text-blue-400 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="mb-2 text-center font-medium text-sm text-white">
              Don&apos;t have an account?{' '}
              <span
                onClick={() => setState('Sign Up')}
                className="text-sm font-bold text-blue-400 cursor-pointer"
              >
                Sign up
              </span>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
