import React, { useEffect, useState } from 'react'
import SlidingBgButton from '../../../ui/SlidingBgButton';
import { ethers } from 'ethers';
import { crowdFunding_abi, crowdFunding_address } from '../../../lib/abi';
import toast, { Toaster } from 'react-hot-toast';

interface CrowdfundingProject {
  projectId: number;
  projectWallet: string;
  goalAmount: number;
  deadline: number;
  amountRaised: number;
  profitSharingRatio: number;
  merchantDeposit: number;
  investmentRoundIsActive: boolean;
  profitDistributionIsDone: boolean;
}
const CrowdfundingProjectBox = ({props}:{props:CrowdfundingProject}) => {
  const [depositAmount, setdepositAmount] = useState('')
  const [contract, setContract] = useState<any>()
  useEffect(() => {
    const handleConnect = async () => {
      const windowObj = window as any;
      const provider = new ethers.BrowserProvider(windowObj.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const crowdFundingContract = new ethers.Contract(
        crowdFunding_address,
        crowdFunding_abi,
        signer
      );
      setContract(crowdFundingContract);
    };
    handleConnect();
  }, []);
  const handleDeposit = async()=>{
    const tx = await contract.depositFunds_Crowdfunding(props.projectId, {value:depositAmount})
    await tx.wait()
    setdepositAmount('')
    toast.success("Amount deposited successfully")
  }
  return (
    < >
      {props.projectId != 0? <div className="w-full md:w-[60%] lg:w-[40%] bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
      <p>Project ID: {props.projectId}</p>
      <p>Project Wallet: {props.projectWallet}</p>
      <p>Goal Amount: {props.goalAmount}</p>
      <p>Merchant Depost: {props.merchantDeposit/1000000000000000000} Eth</p>
      <p>Amount Raised: {props.amountRaised}</p>
      <p>Deadline: {props.deadline}</p>
      <p>Profit Sharing Ratio: {props.profitSharingRatio ? props.profitSharingRatio : 'Not yet decided'}</p>
      <p>Investment Round Active: {props.investmentRoundIsActive == true ? 'Yes' : 'No'}</p>
      <p>Profit Distribution Done: {props.profitDistributionIsDone == true ? 'Yes' : 'No'}</p>
      <input
          className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
          type="text"
          placeholder="Enter amount to deposit"
          value={depositAmount}
          onChange={(e) => setdepositAmount(e.target.value)}
        />
        <div onClick={handleDeposit}>
          <Toaster/>
          <SlidingBgButton title='Deposit'/>
        </div>
    </div>: ''}
    </>
  )
}

export default CrowdfundingProjectBox