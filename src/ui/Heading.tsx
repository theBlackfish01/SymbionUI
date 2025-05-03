import React from 'react'

const Heading = ({children}:{children:string}) => {
  return (
    <div className='bg-clip-text my-5 text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 text-3xl md:text-4xl lg:text-5xl font-bold mt-10 text-center uppercase' >
        {children}
    </div>
  )
}

export default Heading