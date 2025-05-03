import React from 'react'
import Hero from './compnents/hero/Hero'
import CreateProject from './compnents/createProject/CreateProject'
import Navbar from './compnents/navbar/Navbar'
import Projects from './compnents/projects/Projects'
import Banxa from './compnents/banxa/Banxa'
import AllMerchants from './compnents/allMerchants/AllMerchants'
import MyInvestments from './compnents/myInvestments/MyInvestments'
import Contact from './compnents/contact/Contact'

const App = () => {
  return (
    <div className='text-white overflow-hidden'>
      <Navbar/>
      <Hero/>
      <Banxa/>
      <CreateProject/>
      <MyInvestments/>
      <Projects/>
      <AllMerchants/>
      <Contact/>
    </div>
  )
}

export default App