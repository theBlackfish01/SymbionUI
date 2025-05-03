import React from 'react'

const Button = ({children, isSelected, title}:{children:any, isSelected:string, title:string}) => {
  return (
    <button className={`px-5 py-2 rounded-xl ${isSelected == title ? 'bg-[#f76e13] text-white' : 'bg-slate-100 text-gray-800'}`}>
        {children}
    </button>
  )
}

export default Button