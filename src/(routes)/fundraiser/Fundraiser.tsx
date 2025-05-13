import { BigNumberish, ethers } from 'ethers';
import React, { useEffect, useState } from 'react'
import { donationManager_abi, donationManager_address } from '../../lib/abi';
import Heading from '../../ui/Heading';
import SmallHeading from '../../ui/SmallHeading';
import SlidingBgButton from '../../ui/SlidingBgButton';
import FundraisingMyProjectBox from './components/FundraisingMyProjectBox';

const Fundraiser = () => {
    interface fundraisingProjectType {
        projectId: number;
        projectWallet: string;
        goalAmount: number;
        deadline: number;
        amountRaised: number;
      }
    const [contract, setContract] = useState<any>();
    const [address, setAddress] = useState("");
    const [wallet, setwallet] = useState("");
    const [fundraisingProjects, setfundraisingProjects] = useState([])

    const [goalAmount, setgoalAmount] = useState("");
    const [deadline, setdeadline] = useState("");

    const fetchProjects = async()=>{
      if(contract){
        let [frprojectIds, frprojectWallets, frgoalAmounts, frdeadlines, framountsRaised] = await contract.getAllProjects()
    frprojectIds = frprojectIds.map((projectId:BigNumberish)=>{
      return Number(projectId)
    })
    frprojectWallets = frprojectWallets.map((projectWallet:string)=>{
      return projectWallet.toString()
    })
    frgoalAmounts = frgoalAmounts.map((goalamount:BigNumberish)=>{
      return Number(goalamount)
    })
    frdeadlines = frdeadlines.map((deadline:BigNumberish)=>{
      return Number(deadline)
    })
    framountsRaised = framountsRaised.map((amountraised:BigNumberish)=>{
      return Number(amountraised)
    })
    const formatedFrProjects = frprojectIds.map((_:any, i:number)=>{
      return{
        projectId: frprojectIds[i],
        ProjectWallet: frprojectWallets[i],
        goalAmount: frgoalAmounts[i],
        deadline: frdeadlines[i],
        amountRaised: framountsRaised[i]
      }
    })
    setfundraisingProjects(formatedFrProjects)
      }
  }
    useEffect(() => {
      const handleConnect = async () => {
        const windowObj = window as any;
        const provider = new ethers.BrowserProvider(windowObj.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(
          donationManager_address,
          donationManager_abi,
          signer
        );
        setContract(contract);
        setAddress(address);
      };
      handleConnect();
      fetchProjects()
    }, []);
    const handleCreate = async () => {
        const tx = await contract.addProject(address, goalAmount, deadline);
        await tx.wait()
        setwallet('')
        setgoalAmount('')
        setdeadline('')
      };
  return (
    <div className="text-white p-5 md:p-10 flex flex-col gap-5 items-center justify-center bg-[#2a2a2a]">
      <Heading>Fundraiser</Heading>
      {/* create a new project */}
      <div className="w-full md:w-[60%] lg:w-[40%] bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
        <SmallHeading>Create A New Project</SmallHeading>
        <input
          className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
          type="text"
          placeholder="Enter your wallet address"
          value={address}
          onChange={(e) => setwallet(e.target.value)}
        />
        <input
          className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
          type="text"
          placeholder="Enter the goal amount"
          value={goalAmount}
          onChange={(e) => setgoalAmount(e.target.value)}
        />
        <input
          className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
          type="text"
          placeholder="Enter the deadline"
          value={deadline}
          onChange={(e) => setdeadline(e.target.value)}
        />
        <div onClick={handleCreate}>
          <SlidingBgButton title="Create" />
        </div>
      </div>


      {/* my projects */}
      <div className="w-full md:w-[60%] lg:w-[40%] bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
       <SmallHeading>My Projects</SmallHeading>
            <div className='flex flex-col items-center justify-center'>
            {fundraisingProjects.map((project:fundraisingProjectType,idx)=>{
                return(
                    <div key={idx}>
                        <FundraisingMyProjectBox props = {project}/>
                    </div>
                )
            })}
            </div>
           <div onClick={fetchProjects} className='mt-5'>
           <SlidingBgButton title='Refresh'/>
           </div>
        </div>
    </div>
  )
}

export default Fundraiser