import React from 'react'
import { Spotlight } from '../../ui/SpotLight'

const Hero = () => {
  return (
    <div id="home" className="h-screen w-screen overflow-hidden relative">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 z-50 absolute"
        fill="white"
      />
      <div className="h-screen w-full bg-black  bg-grid-white/[0.2] relative flex items-center justify-center">
    {/* Radial gradient for the container to give a faded look */}
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    <div className="flex-col gap-2 p-5 md:p-10 xl:p-20 text-center ">
          <p className="relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 md:text-2xl">
            Dreams. Causes. Funded
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 text-4xl md:text-6xl font-bold">
            Dreams don't wait. Launch your project on{" "}
            <span className="text-[#d3d2d2]">SYMBION</span>.
          </p>
        </div>
  </div>
  </div>
  )
}

export default Hero