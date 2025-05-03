import React, { useEffect, useState } from "react";
import NavLink from "./compnents/NavLink";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { useStore } from '../../zustand/store';

const Navbar = () => {
  const [scrollDirection, setScrollDirection] = useState("upward");
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const updateProvider = useStore((state)=> state.updateProvider )
  const updateSigner = useStore((state)=> state.updateSigner)
  const provider = useStore((state)=> state.provider)
  const handleConnect=async()=>{
    const provider = new ethers.BrowserProvider(window.ethereum)
    // await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    updateProvider(provider)
    updateSigner(signer)
  }
  useEffect(() => {
    handleConnect()
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        setScrollDirection("downward");
      } else if (scrollTop < lastScrollTop) {
        setScrollDirection("upward");
      }
      setLastScrollTop(scrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);
  return (
    <div className="relative z-50">
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }}>
        <div
          className={`flex justify-center items-center gap-3 md:gap-5  bg-[#00000057] hover:bg-[#00000093] transition-all duration-700 py-3 px-8 rounded-lg w-fit fixed ${
            scrollDirection === "upward"
              ? "translate-y-0"
              : "-translate-y-[100px]"
          } left-[50%] -translate-x-[50%] top-5 shadow-black shadow-lg capitalize text-sm font-light backdrop-blur-lg`}
        >
          <NavLink path="home" title="Home" />
          <NavLink path="create" title="Create Project" />
          <NavLink path="projects" title="All Projects" />
          <NavLink path="contact" title="Contact" />

        </div>
      </motion.div>
      <button className='fixed top-5 right-5 md:right-10 text-white flex items-center justify-center gap-3 bg-[#00000057] hover:bg-[#000000cb] transition-all duration-700 px-8 py-3 rounded-xl text-sm' onClick={handleConnect}>
      <img className='h-[20px] w-[20px]' src={'/images/metamask-icon.png'} height={50} width={50} alt='metamask-image' />
          {provider ? "Metamask Connected" :"Connect Metamask"}
        </button>
    </div>
  );
};

export default Navbar;
