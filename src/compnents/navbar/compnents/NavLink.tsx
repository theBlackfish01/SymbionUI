import {Link} from 'react-scroll'
import React from 'react'

const NavLink = (props:{path:string, title:string}) => {
  return (
    <Link 
    to={props.path} 
      spy={true}
      smooth={true}
      offset={50}
      duration={500}
    className='text-sm text-[#e2e1e1] hover:text-white uppercase cursor-pointer hover:scale-105 transition-all duration-300 ease-linear'>
        {props.title}
    </Link>
  )
}

export default NavLink