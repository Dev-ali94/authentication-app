import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Main = () => {
  const {userData}=useContext(AppContext)
  return (
<div className="flex flex-col justify-center items-center mt-20 p-6">
  <div className="relative z-10 flex flex-col items-center  text-white">
    <img src={assets.header_img} alt="" 
         className="w-40 h-40 mb-4 rounded-full border-4 border-white shadow-md bg-gray-900/70"/>
    <div className='flex flex-col items-center gap-y-1 mb-4'>

    <div className="flex flex-row items-center space-x-2">
      <h2 className="text-2xl font-bold ">Hey {userData ? userData.name: 'developer'}</h2>
      <img src={assets.hand_wave} alt="" className="w-7" />
    </div>
    
    <h1 className="text-3xl font-extrabold drop-shadow-md text-center">
      WELCOME TO MY APP
    </h1>
    </div>
      <button className='border border-white text-white font-semibold 
                    rounded-full px-6 py-2 hover:bg-white hover:text-gray-900 transition-all shadow-md cursor-pointer'>Get Started</button>
  </div>
</div>

  )
}

export default Main
