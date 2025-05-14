import React, { useState } from "react";
import { useStore } from "../../../zustand/store";
import { Contract, ethers, toNumber } from "ethers";
import { donationManager_abi, donationManager_address } from "../../../lib/abi";
// import { useRouter } from 'next/navigation'
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

interface fundraisingProjectType {
  projectId: number;
  projectWallet: string;
  goalAmount: number;
  deadline: number;
  amountRaised: number;
}
const FundraisingProjectBox = ({props}: {
  props:fundraisingProjectType
}) => {
  console.log(props);
  // const router = useRouter()
  const notify = () => toast.success("Project Deleted Successfully");
  const navigate = useNavigate();
  const provider = useStore((state) => state.provider);
  const signer = useStore((state) => state.signer);
  const contract = new Contract(donationManager_address, donationManager_abi, signer);
  const [amount, setAmount] = useState('')
  const handleDelete = async (id: string) => {
    try {
      const tx = await contract.deleteProject(id);
      await tx.wait();
      notify();
      // router.push('/')
      // navigate('/');
    } catch (err) {
      console.log("Failed to delete with error, ", err);
    }
  };
  const handleDeposit = async (projectId: string) => {
    const tx = await contract.depositFunds_Fundraising(projectId, {
      value: amount.toString(),
    });
    toast.promise(tx.wait(), {
      loading: "Depositing Ether",
      success: `${amount} Ethers Deposited successfully`,
      error: (err) => `Error: ${err}`,
    });
    setAmount('')
  };
  console.log(props.projectWallet);
  return (
    <div className="">
      {props.projectId != 0 ? (
        <div
          key={props.projectId}
          className="md:max-w-[450px] lg:max-w-[600px] bg-[#ffffff18] px-5 py-10 shadow-black rounded-lg shadow-lg text-white w-full"
        >
          <p className="mb-2">
            <span className="font-semibold">Project ID: </span>
            {props.projectId}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Project Wallet: </span>
            {props.projectWallet}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Goal Amount: </span>
            {props.goalAmount} ETH
          </p>
          <p className="mb-2">
            <span className="font-semibold">Deadline: </span>
            {props.deadline} {toNumber(props.deadline)>1?'days':'day'}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Amount Raised: </span>
            {props.amountRaised} ETH
          </p>
          <div className="flex gap-3">
            <input onChange={(e:any)=> setAmount(e.target.value)} value={amount} className=" outline-none border-b-[1px] border-white bg-transparent" type="text" placeholder="Enter Amount" />
            <button
              onClick={() => handleDeposit(props.projectId.toString())}
              className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm shadow-lg shadow-gray-800 hover:bg-green-700 transition-all duration-300"
            >
              Deposit ETH
            </button>
          </div>
          <Toaster />
        </div>
      ) :
        ""}
    </div>
  );
};

export default FundraisingProjectBox;
