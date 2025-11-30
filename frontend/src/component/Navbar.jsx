import React, { useContext } from 'react'
import {useNavigate} from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
const Navbar = () => {
  const navigate = useNavigate()
 const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

const logout = async () => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/auth/logout`,
      {},
      { withCredentials: true } // ✅ ensure cookies are sent
    );

    if (data.success) { // ✅ correct key
      setIsLoggedIn(false);
      setUserData(null);
      navigate("/");
    } else {
      toast.error(data.message || "Logout failed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  return (
<div className="w-full flex items-center bg-gray-950/40
justify-between px-2 sm:px-12 absolute top-0 h-18">
  {/* Logo Text */}
  <div className="flex items-center h-full">
    <h2 className="text-base sm:text-xl font-extrabold text-white">
      AskMe
    </h2>
  </div>
<div className="relative group">
  {userData ? (
    <>
      {/* Avatar Trigger */}
      <div
        className="w-10 h-10 flex items-center justify-center 
        rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
        text-white font-bold cursor-pointer select-none 
        transition-transform duration-200 group-hover:scale-105"
      >
        {userData?.name?.charAt(0).toUpperCase()}
      </div>

      {/* Dropdown */}
      <div
        className="absolute hidden group-hover:flex hover:flex flex-col items-center 
          w-56 bg-gray-900/95 top-12 -right-5 z-20 text-white 
          rounded-2xl shadow-xl border border-gray-700 
          transition-all duration-200 ease-out"
      >
        <div className="flex flex-col items-center p-4">
          {/* Avatar inside dropdown */}
          <div
            className="w-14 h-14 flex items-center justify-center rounded-full 
            bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
            text-lg font-bold shadow-md"
          >
            {userData?.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="mt-3 text-center">
            <h2 className="text-base font-semibold">{userData?.name}</h2>
            <p className="text-sm text-gray-400">{userData?.email}</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 my-3"></div>

          {/* Logout Button */}
          <button
          onClick={logout}
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 
            hover:opacity-90 transition-all text-sm font-medium shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  ) : (
    <button
      onClick={() => navigate("/login")}
      className="rounded-full px-5 py-2 text-sm font-medium
      border border-gray-400/50 text-gray-200 bg-gray-800/50 
      hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 
      hover:text-white hover:border-transparent transition-all 
      shadow-sm"
    >
      Login
    </button>
  )}
</div>

</div>



  )
}

export default Navbar