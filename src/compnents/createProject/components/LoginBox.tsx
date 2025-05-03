import React from 'react'
import SmallHeading from '../../../ui/SmallHeading'
import SlidingBgButton from '../../../ui/SlidingBgButton'
import { Link } from 'react-router-dom'

const LoginBox = (props:{text:string, btnText:string, btnPath:string}) => {
  return (
    <div className='p-5 md:p-8 rounded-lg bg-[#ffffff1b] shadow-black shadow-xl flex flex-col items-center justify-center' >
        <SmallHeading>
            {props.text}
        </SmallHeading>
      <Link to={props.btnPath}>
      <SlidingBgButton title={props.btnText}/>
      </Link>
    </div>
  )
}

export default LoginBox