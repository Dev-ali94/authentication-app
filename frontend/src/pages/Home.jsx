import React from 'react'
import Navbar from '../component/Navbar'
import Main from '../component/Main'

const Home = () => {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen
    bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'>
      <Navbar/>
      <Main/>
  

    </div>
  )
}

export default Home
