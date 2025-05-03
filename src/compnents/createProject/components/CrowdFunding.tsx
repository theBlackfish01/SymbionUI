import React from 'react'
import SmallHeading from '../../../ui/SmallHeading';
import SlidingBgButton from '../../../ui/SlidingBgButton';
import { useStore } from '../../../zustand/store';
import { Contract } from 'ethers';
import { contract_abi, contract_address } from '../../../lib/abi';
import {toast, Toaster} from 'react-hot-toast';

const CrowdFunding = () => {
  const notify = () => toast.success('Merchant Created Successfully');
    const provider = useStore((state) => state.provider);
    const signer = useStore((state) => state.signer);
    const contract = new Contract(contract_address, contract_abi, signer)
    const handleMerchant = async()=>{
        const tx = await contract.addMerchant()
        await tx.wait()
        notify()
    }
  return (
    <div className="flex items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-5 my-10 bg-[#ffffff18] w-fit rounded-2xl p-10 shadow-lg shadow-black">
            <SmallHeading>CrowdFunding</SmallHeading>
            <div onClick={handleMerchant}>
                <Toaster/>
            <SlidingBgButton title='Become a Merchant'/>
            </div>
            </div>
        </div>
  )
}

export default CrowdFunding