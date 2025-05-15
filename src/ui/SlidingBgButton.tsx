import { color } from 'framer-motion'
import React from 'react'

const SlidingBgButton = (props:{title:string, selected?:string, color?:string}) => {
  return (
    <button className={`w-full px-5 py-2 rounded-xl bg-slate-200 text-gray-800 group hover:text-slate-100 transition-all duration-300 relative ${props.selected == props.title.toLowerCase()? "text-white " : 'text-gray-800'} `} >
        <div className={`h-full rounded-xl absolute w-0 group-hover:w-full duration-300 transition-all bg-[#F76E13] top-0 left-0 ${props.selected == props.title.toLowerCase()? "w-full " : 'w-0 '}`}></div>
        <div className='relative z-10'>{props.title}</div>
    </button>
  )
}

export default SlidingBgButton