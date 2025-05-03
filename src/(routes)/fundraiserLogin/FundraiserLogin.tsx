import React from 'react'
import Heading from '../../ui/Heading'
import SlidingBgButton from '../../ui/SlidingBgButton'
import { Link } from 'react-router-dom'

const FundraiserLogin = () => {
  return (
    <div className='h-screen text-white flex flex-col items-center justify-center p-10 md:p-14'>
            <Heading>
                Login
            </Heading>
        <div className='flex flex-col bg-[#fff2] w-[40%] h-full rounded-xl shadow-black shadow-xl'>
            <div className='h-full p-5 flex flex-col justify-center gap-3' >
                <input className='px-3 py-2 w-full bg-transparent outline-none border-b-[1px] border-white placeholder:text-white' placeholder='Enter Your Wallet Address' type="text" />
            <Link to={'/fundraiser'}>
            <SlidingBgButton title='Login'/>
            </Link>

               
            </div>

            {/* <div className='p-5 flex flex-col gap-3' >
            <p>Not registered as a Fundraiser at Symbion?</p>
            <SlidingBgButton title='Register Now'/> 
            </div> */}
            
        </div>
    </div>
  )
}

export default FundraiserLogin