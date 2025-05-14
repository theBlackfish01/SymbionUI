import { BigNumberish, ethers } from "ethers";
import React, { useEffect, useState, useRef, useCallback } from "react"; // Added useRef and useCallback
import { donationManager_abi, donationManager_address } from "../../lib/abi";
import Heading from "../../ui/Heading";
import SmallHeading from "../../ui/SmallHeading";
import SlidingBgButton from "../../ui/SlidingBgButton";
import FundraisingMyProjectBox from "./components/FundraisingMyProjectBox";
import toast, { Toaster } from "react-hot-toast";

const Fundraiser = () => {
  interface fundraisingProjectType {
    projectId: number;
    projectWallet: string;
    goalAmount: number;
    deadline: number;
    amountRaised: number;
  }

  // State management
  const [contract, setContract] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [fundraisingProjects, setFundraisingProjects] = useState<any[]>([]);
  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [formErrors, setFormErrors] = useState({
    goalAmount: "",
    deadline: "",
  });
  const [connectionError, setConnectionError] = useState("");
  const initialConnectionToastShown = useRef(false); // Added ref to track toast

  // Fetch all projects from the contract
  const fetchProjects = useCallback(async () => {
    // Wrapped with useCallback
    if (!contract) {
      toast.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Fetching projects...", { id: "fetchProjects" });

      const [
        frprojectIds,
        frprojectWallets,
        frgoalAmounts,
        frdeadlines,
        framountsRaised,
      ] = await contract.getAllProjects();

      const frprojectIdsFormatted = frprojectIds.map(
        (projectId: BigNumberish) => Number(projectId)
      );
      const frprojectWalletsFormatted = frprojectWallets.map(
        (projectWallet: string) => projectWallet.toString()
      );
      const frgoalAmountsFormatted = frgoalAmounts.map(
        (goalamount: BigNumberish) => Number(goalamount)
      );
      const frdeadlinesFormatted = frdeadlines.map((deadline: BigNumberish) =>
        Number(deadline)
      );
      const framountsRaisedFormatted = framountsRaised.map(
        (amountraised: BigNumberish) => Number(amountraised)
      );

      const formatedFrProjects = frprojectIdsFormatted.map(
        (_: any, i: number) => {
          return {
            projectId: frprojectIdsFormatted[i],
            projectWallet: frprojectWalletsFormatted[i],
            goalAmount: frgoalAmountsFormatted[i],
            deadline: frdeadlinesFormatted[i],
            amountRaised: framountsRaisedFormatted[i],
          };
        }
      );

      setFundraisingProjects(formatedFrProjects);
      toast.success("Projects fetched successfully!", { id: "fetchProjects" });
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error(
        `Failed to fetch projects: ${
          error.reason || error.message || "Unknown error"
        }`,
        { id: "fetchProjects" }
      );
    } finally {
      setIsLoading(false);
    }
  }, [contract]); // Added contract as a dependency for useCallback

  // Initialize contract and wallet connection
  useEffect(() => {
    const handleConnect = async () => {
      // If already connected (e.g., from a previous run of this effect in StrictMode)
      if (contract && address) {
        setIsConnecting(false); // Ensure loading state is off
        return;
      }

      try {
        setIsConnecting(true);
        setConnectionError("");

        const windowObj = window as any;

        if (!windowObj.ethereum) {
          setConnectionError(
            "No Ethereum wallet detected. Please install MetaMask or a similar wallet."
          );
          // setIsConnecting(false); // Handled by finally
          return;
        }

        const provider = new ethers.BrowserProvider(windowObj.ethereum);

        try {
          const signer = await provider.getSigner();
          const newAddress = await signer.getAddress(); // Use new local variables
          const newContract = new ethers.Contract( // Use new local variables
            donationManager_address,
            donationManager_abi,
            signer
          );

          setContract(newContract);
          setAddress(newAddress);

          // Show toast only once for the initial connection
          if (!initialConnectionToastShown.current) {
            toast.success("Wallet connected successfully!");
            initialConnectionToastShown.current = true;
          }
        } catch (err: any) {
          console.error("Failed to get signer:", err);
          setConnectionError(
            "Failed to connect wallet. Please make sure your wallet is unlocked and connected to the correct network."
          );
          toast.error("Failed to connect wallet");
        }
      } catch (err: any) {
        console.error("Connection error:", err);
        setConnectionError(
          `Connection error: ${err.message || "Unknown error"}`
        );
        toast.error("Failed to connect to blockchain");
      } finally {
        setIsConnecting(false);
      }
    };

    handleConnect();
  }, [contract, address]); // Added contract and address to dependencies

  // Fetch projects when contract is available
  useEffect(() => {
    if (contract) {
      fetchProjects();
    }
  }, [contract, fetchProjects]); // Added fetchProjects to dependencies

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    const errors = { goalAmount: "", deadline: "" };

    // Validate goal amount
    if (!goalAmount.trim()) {
      errors.goalAmount = "Goal amount is required";
      isValid = false;
    } else if (isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
      errors.goalAmount = "Goal amount must be a positive number";
      isValid = false;
    }

    // Validate deadline
    if (!deadline.trim()) {
      errors.deadline = "Deadline is required";
      isValid = false;
    } else if (
      isNaN(Number(deadline)) ||
      !Number.isInteger(Number(deadline)) ||
      Number(deadline) <= 0
    ) {
      errors.deadline = "Deadline must be a positive integer";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle project creation
  const handleCreate = async () => {
    if (!contract) {
      toast.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    try {
      setIsLoading(true);

      const tx = await contract.addProject(address, goalAmount, deadline);

      toast.promise(tx.wait(), {
        loading: "Creating project...",
        success: "Project created successfully!",
        error: (err) =>
          `Failed to create project: ${
            err.reason || err.message || "Unknown error"
          }`,
      });

      await tx.wait();

      // Reset form
      setGoalAmount("");
      setDeadline("");

      // Refresh project list
      fetchProjects();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(
        `Failed to create project: ${
          error.reason || error.message || "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reconnect wallet
  const handleReconnect = async () => {
    const windowObj = window as any;

    if (!windowObj.ethereum) {
      toast.error("No Ethereum wallet detected. Please install MetaMask.");
      return;
    }

    try {
      // Request account access
      await windowObj.ethereum.request({ method: "eth_requestAccounts" });

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
      setConnectionError("");
      toast.success("Wallet reconnected successfully!");

      // Fetch projects after successful connection
      fetchProjects();
    } catch (err: any) {
      console.error("Reconnection error:", err);
      toast.error(
        `Failed to reconnect wallet: ${err.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="text-white p-5 md:p-10 flex flex-col gap-5 items-center justify-center bg-[#2a2a2a]">
      <Toaster position="top-center" />
      <Heading>Fundraiser</Heading>

      {/* Wallet Connection Status */}
      {connectionError && (
        <div className="w-full md:w-[60%] lg:w-[40%] bg-red-700 p-4 rounded-lg mb-2">
          <p className="text-white">{connectionError}</p>
          <button
            className="mt-2 bg-white text-red-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            onClick={handleReconnect}
          >
            Reconnect Wallet
          </button>
        </div>
      )}

      {/* Create a new project */}
      <div className="w-full md:w-[60%] lg:w-[40%] bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
        <SmallHeading>Create A New Project</SmallHeading>
        <div className="mb-4">
          <p className="text-sm mb-2">
            Connected Wallet: {address ? address : "Not connected"}
          </p>
        </div>
        <div className="mb-4">
          <input
            className={`w-full mb-1 bg-transparent outline-none border-b-[1px] ${
              formErrors.goalAmount ? "border-red-500" : "border-white"
            } p-2 text-white placeholder:text-white`}
            type="text"
            placeholder="Enter the goal amount (ETH)"
            value={goalAmount}
            onChange={(e) => {
              setGoalAmount(e.target.value);
              if (formErrors.goalAmount) {
                setFormErrors({ ...formErrors, goalAmount: "" });
              }
            }}
            disabled={isLoading || !contract}
          />
          {formErrors.goalAmount && (
            <p className="text-red-500 text-xs">{formErrors.goalAmount}</p>
          )}
        </div>
        <div className="mb-4">
          <input
            className={`w-full mb-1 bg-transparent outline-none border-b-[1px] ${
              formErrors.deadline ? "border-red-500" : "border-white"
            } p-2 text-white placeholder:text-white`}
            type="text"
            placeholder="Enter the deadline (days)"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (formErrors.deadline) {
                setFormErrors({ ...formErrors, deadline: "" });
              }
            }}
            disabled={isLoading || !contract}
          />
          {formErrors.deadline && (
            <p className="text-red-500 text-xs">{formErrors.deadline}</p>
          )}
        </div>
        <div
          onClick={!isLoading && contract ? handleCreate : undefined}
          className={
            !isLoading && contract
              ? "cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }
        >
          <SlidingBgButton title={isLoading ? "Creating..." : "Create"} />
        </div>
      </div>

      {/* My projects */}
      <div className="w-full md:w-[60%] lg:w-[40%] bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
        <SmallHeading>My Projects</SmallHeading>
        {isConnecting ? (
          <div className="flex justify-center items-center py-10">
            <p>Connecting to wallet...</p>
          </div>
        ) : (
          <>
            {fundraisingProjects.length === 0 ? (
              <div className="text-center py-5">
                <p>No projects found. Create a new project to get started!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                {fundraisingProjects.map(
                  (project: fundraisingProjectType, idx) => (
                    <div key={idx}>
                      <FundraisingMyProjectBox props={project} />
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
        <div
          onClick={!isLoading && contract ? fetchProjects : undefined}
          className={`mt-5 ${
            !isLoading && contract
              ? "cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <SlidingBgButton title={isLoading ? "Refreshing..." : "Refresh"} />
        </div>
      </div>
    </div>
  );
};

export default Fundraiser;
