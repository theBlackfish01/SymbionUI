import React, { useEffect, useState } from "react";
import { useStore } from "../../../zustand/store";
import { Contract, ethers, toNumber } from "ethers";
import { donationManager_address, donationManager_abi } from "../../../lib/abi";
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
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize contract
  useEffect(() => {
    const init = async () => {
      try {
        const windowObj = window as any;

        if (!windowObj.ethereum) {
          setContractError(
            "No Ethereum wallet detected. Please install MetaMask or a similar wallet."
          );
          return;
        }

        const provider = new ethers.BrowserProvider(windowObj.ethereum);

        try {
          const signer = await provider.getSigner();
          const contract = new Contract(
            donationManager_address,
            donationManager_abi,
            signer
          );
          setContract(contract);
          setContractError(null);
        } catch (err: any) {
          setContractError(
            "Failed to connect to wallet. Please make sure you're connected to the correct network."
          );
          console.error("Signer error: ", err);
        }
      } catch (err: any) {
        setContractError(
          "Failed to initialize contract: " + (err.message || "Unknown error")
        );
        console.error("Contract initialization error: ", err);
      }
    };

    init();
  }, []);

  // Validate withdrawal amount input
  const validateWithdrawalAmount = (amount: string): boolean => {
    setInputError(null);

    if (!amount || amount.trim() === "") {
      setInputError("Please enter a withdrawal amount");
      return false;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      setInputError("Please enter a valid number");
      return false;
    }

    if (numAmount <= 0) {
      setInputError("Amount must be greater than 0");
      return false;
    }

    if (numAmount > props.amountRaised) {
      setInputError("Cannot withdraw more than the amount raised");
      return false;
    }

    return true;
  };

  // Success notification
  const notifySuccess = (message: string) => toast.success(message);

  // Error notification
  const notifyError = (message: string) => toast.error(message);

  // Handle project deletion
  const handleDelete = async (id: string) => {
    if (!contract) {
      notifyError(
        "Contract not connected. Please check your wallet connection."
      );
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.deleteProject(id);

      toast.promise(tx.wait(), {
        loading: "Deleting project...",
        success: "Project deleted successfully!",
        error: "Failed to delete project",
      });

      await tx.wait();
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Failed to delete with error: ", err);
      notifyError(err.reason || err.message || "Failed to delete project");
    }
  };

  // Handle fund withdrawal
  const handleWithdrawal = async (
    projectId: string,
    withdrawalAmount: string
  ) => {
    if (!contract) {
      notifyError(
        "Contract not connected. Please check your wallet connection."
      );
      return;
    }

    if (!validateWithdrawalAmount(withdrawalAmount)) {
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.withdrawFunds(
        projectId,
        ethers.parseEther(withdrawalAmount)
      );

      toast.promise(tx.wait(), {
        loading: "Withdrawing funds...",
        success: "Funds withdrawn successfully!",
        error: (err) =>
          `Withdrawal failed: ${err.reason || err.message || "Unknown error"}`,
      });

      await tx.wait();
      setIsLoading(false);
      setWithdrawalAmount(""); // Clear input after successful withdrawal
    } catch (err: any) {
      setIsLoading(false);
      console.error("Withdrawal failed:", err);
      notifyError(err.reason || err.message || "Withdrawal failed");
    }
  };

  // Don't render anything for projectId 0
  if (props.projectId === 0) {
    return null;
  }

  return (
    <div className="">
      <div className="text-sm bg-[#ffffff18] px-5 py-10 shadow-black rounded-lg shadow-lg m-3 text-white w-fit">
        {contractError && (
          <div className="mb-4 p-2 bg-red-700 rounded-md text-white">
            {contractError}
          </div>
        )}

        <p className="mb-2">
          <span className="font-semibold">Project ID:</span> {props.projectId}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Project Wallet:</span>{" "}
          {props.projectWallet}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Goal Amount:</span> {props.goalAmount}{" "}
          ETH
        </p>
        <p className="mb-2">
          <span className="font-semibold">Deadline:</span> {props.deadline}{" "}
          {toNumber(props.deadline) > 1 ? "days" : "day"}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Amount Raised:</span>{" "}
          {props.amountRaised} ETH
        </p>

        <div className="relative">
          <input
            className={`px-3 py-2 w-full mb-1 bg-transparent outline-none border-b-[1px] ${
              inputError ? "border-red-500" : "border-white"
            } placeholder:text-white`}
            placeholder="Enter ethers to withdraw"
            type="text"
            value={withdrawalAmount}
            onChange={(e) => {
              setWithdrawalAmount(e.target.value);
              // Clear error on input change
              if (inputError) setInputError(null);
            }}
            disabled={isLoading}
          />
          {inputError && (
            <p className="text-red-500 text-xs mb-2">{inputError}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              handleWithdrawal(props.projectId.toString(), withdrawalAmount)
            }
            className={`bg-blue-600 text-white px-5 py-2 rounded-xl text-sm shadow-lg shadow-gray-800 
              ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              } 
              transition-all duration-300`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Withdraw ETH"}
          </button>
          <button
            onClick={() => handleDelete(props.projectId.toString())}
            className={`bg-red-600 text-white px-5 py-2 rounded-xl text-sm shadow-lg shadow-gray-800 
              ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
              }
              transition-all duration-300`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Delete Project"}
          </button>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default FundraisingMyProjectBox;
