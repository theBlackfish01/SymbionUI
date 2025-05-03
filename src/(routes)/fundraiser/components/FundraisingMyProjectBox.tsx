import React, { useEffect, useState } from "react";
import { useStore } from "../../../zustand/store";
import { Contract, ethers, toNumber } from "ethers";
import { donationManager_address, donationManager_abi } from "../../../lib/abi";
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
const FundraisingMyProjectBox = ({
  props,
}: {
  props: fundraisingProjectType;
}) => {
  const [contract, setContract] = useState<any>();
  const [withdrawalAmount, setwithdrawalAmount] = useState<any>();
  // const router = useRouter()
  useEffect(() => {
    const init = async () => {
      const windowObj = window as any;
      const provider = new ethers.BrowserProvider(windowObj.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        donationManager_address,
        donationManager_abi,
        signer
      );
      setContract(contract);}
      init();
  }, []);
  const notify = () => toast.success("Project Deleted Successfully");
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (contract) {
      try {
        const tx = await contract.deleteProject(id);
        await tx.wait();
        notify();
      } catch (err) {
        console.log("Failed to delete with error, ", err);
      }
    } else {
      console.log("contract not found");
    }
  };
  const handleWithdrawal = async (
    projectId: string,
    withdrawalAmount: string
  ) => {
    const tx = await contract.withdrawFunds(
      projectId,
      ethers.parseEther(withdrawalAmount)
    );
    toast.promise(tx.wait(), {
      loading: "Withdrawing Ether",
      success: "Ethers Withdrawn successfully",
      error: (err) => `Error: ${err}`,
    });
  };
  const id = props.projectId;
  return (
    <div className="">
      {props.projectId != 0 ? (
        <div
          key={props.projectId}
          className="text-sm bg-[#ffffff18] px-5 py-10 shadow-black rounded-lg shadow-lg m-3 text-white w-fit"
        >
          <p className="mb-2">
            <span className="font-semibold">Project ID:</span> {props.projectId}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Project Wallet:</span>{" "}
            {props.projectWallet}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Goal Amount:</span>{" "}
            {props.goalAmount} ETH
          </p>
          <p className="mb-2">
            <span className="font-semibold">Deadline:</span> {props.deadline}{" "}
            {toNumber(props.deadline) > 1 ? "days" : "day"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Amount Raised:</span>{" "}
            {props.amountRaised} ETH
          </p>
          <input className='px-3 py-2 w-full mb-3 bg-transparent outline-none border-b-[1px] border-white placeholder:text-white' placeholder='Enter ethers to withdraw' type="text" onChange={((e)=> setwithdrawalAmount(e.target.value))} />
          <div className="flex gap-3">
            <button
              onClick={() => handleWithdrawal(props.projectId.toString(), withdrawalAmount)}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm shadow-lg shadow-gray-800 hover:bg-blue-700 transition-all duration-300"
            >
              Withdraw ETH
            </button>
            <button
              onClick={() => handleDelete(props.projectId.toString())}
              className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm shadow-lg shadow-gray-800 hover:bg-red-700 transition-all duration-300"
            >
              Delete Project
            </button>
          </div>
          <Toaster />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default FundraisingMyProjectBox;
