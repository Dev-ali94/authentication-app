import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // 🔑 Check auth state
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/auth`, {
        withCredentials: true, // ✅ send cookies/token
      });

      if (data.success) {
        setIsLoggedIn(true);
        getUserData(); // fetch user details
      } 
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 👤 Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true, // ✅ send cookies/token
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
        setUserData(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setUserData(null);
    }
  };

  // 🚀 Run on page load
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
