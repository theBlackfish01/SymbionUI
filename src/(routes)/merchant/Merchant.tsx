import { BigNumberish, ethers } from "ethers";
import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import { crowdFunding_abi, crowdFunding_address } from "../../lib/abi";
import SmallHeading from "../../ui/SmallHeading";
import Heading from "../../ui/Heading";
import SlidingBgButton from "../../ui/SlidingBgButton";
import toast, { Toaster } from "react-hot-toast";

interface CrowdfundingProjectType {
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
interface InvestmentType {
  investmentId: number;
  investor: string;
  amount: number;
  refundStatuse: boolean;
  projectId: number;
}

const Merchant = () => {
  const [wallet, setWallet] = useState("");
  const [formatedData, setformatedData] = useState<InvestmentType[]>([]);
  const [projectIdForStartInvestment, setprojectIdForStartInvestment] =
    useState("");
  const [goalAmountForStartInvestment, setgoalAmountForStartInvestment] =
    useState("");
  const [yourDepositForStartInvestment, setyourDepositForStartInvestment] =
    useState("");
  const [deadlineForStartInvestment, setdeadlineForStartInvestment] =
    useState("");
  const [
    profitSharingRatioForStartInvestment,
    setprofitSharingRatioForStartInvestment,
  ] = useState("");

  const [projectIdForEndInvestment, setprojectIdForEndInvestment] =
    useState("");
  const [myProjects, setMyProjects] = useState<CrowdfundingProjectType[]>([]);
  const [projectIdForProfitDistribution, setprojectIdForProfitDistribution] =
    useState("");
  const [profitAmount, setprofitAmount] = useState("");

  const [contract, setContract] = useState<any>(null); // Initialize contract as null
  const [address, setAddress] = useState("");

  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    null
  );

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Toggle expansion of a project
  const toggleExpand = (projectId: number) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  // Transaction History Modal component
  const TransactionHistoryModal = ({
    open,
    onClose,
    transactions,
  }: {
    open: boolean;
    onClose: () => void;
    transactions: InvestmentType[];
  }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#232323] rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
          <button
            className="absolute top-3 right-3 text-white text-2xl hover:text-red-400"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4 text-white">
            Transaction History
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-300">No transactions found.</p>
          ) : (
            <table className="w-full text-sm text-left text-gray-200">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Investor</th>
                  <th className="py-2 px-2">Project ID</th>
                  <th className="py-2 px-2">Amount (ETH)</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, id) => {
                  if (id === 0) return;
                  return (
                    <tr
                      key={tx.investmentId}
                      className="border-b border-gray-700 hover:bg-[#333]"
                    >
                      <td className="py-2 px-2">{tx.investmentId}</td>
                      <td className="py-2 px-2">
                        {tx.investor.slice(0, 8)}...{tx.investor.slice(-6)}
                      </td>
                      <td className="py-2 px-2">{tx.projectId}</td>
                      <td className="py-2 px-2">
                        {ethers.formatEther(BigInt(tx.amount))}
                      </td>
                      <td className="py-2 px-2">
                        {tx.refundStatuse ? "Refunded" : "Not Refunded"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // Define fetch functions outside of useEffect
  const fetchMyProjects = useCallback(
    async (contractInstance: any, userAddress: string) => {
      if (!contractInstance) return; // Do nothing if contract is not ready
      try {
        let [cfProjectIds, cfProjectWallets]: [BigNumberish[], string[]] =
          await contractInstance.getAllProjects(); // Note: Contract might return BigNumberish
        let [
          cfgoalAmounts,
          cfdeadlines,
          cfamountsRaised,
          cfprofitSharingRatios,
          cfmerchantDeposits,
          cfinvestmentRoundsActive,
          cfprofitDistributionsDone,
        ]: [
          BigNumberish[],
          BigNumberish[],
          BigNumberish[],
          BigNumberish[],
          BigNumberish[],
          boolean[],
          boolean[]
        ] = await contractInstance.getAllInvestmentRoundDetails(); // Note: Contract might return BigNumberish/boolean

        // Ensure all arrays have the same length before mapping
        if (
          cfProjectIds.length !== cfProjectWallets.length ||
          cfProjectIds.length !== cfgoalAmounts.length ||
          cfProjectIds.length !== cfdeadlines.length ||
          cfProjectIds.length !== cfamountsRaised.length ||
          cfProjectIds.length !== cfprofitSharingRatios.length ||
          cfProjectIds.length !== cfmerchantDeposits.length ||
          cfProjectIds.length !== cfinvestmentRoundsActive.length ||
          cfProjectIds.length !== cfprofitDistributionsDone.length
        ) {
          console.error("Mismatch in array lengths fetched from contract.");
          toast.error("Failed to fetch project details due to data mismatch.");
          return;
        }

        const formatedCfProjects: CrowdfundingProjectType[] = cfProjectIds.map(
          (_: any, i: number) => {
            return {
              projectId: Number(cfProjectIds[i]), // Convert BigNumberish to Number
              projectWallet: cfProjectWallets[i],
              goalAmount: Number(cfgoalAmounts[i]), // Convert BigNumberish to Number
              deadline: Number(cfdeadlines[i]), // Convert BigNumberish to Number
              amountRaised: Number(cfamountsRaised[i]), // Convert BigNumberish to Number
              profitSharingRatio: Number(cfprofitSharingRatios[i]), // Convert BigNumberish to Number
              merchantDeposit: Number(cfmerchantDeposits[i]), // Convert BigNumberish to Number
              investmentRoundIsActive: cfinvestmentRoundsActive[i],
              profitDistributionIsDone: cfprofitDistributionsDone[i],
            };
          }
        );

        const filteredProjects: CrowdfundingProjectType[] =
          formatedCfProjects.filter((project: CrowdfundingProjectType) => {
            return (
              project.projectWallet.toLowerCase() === userAddress.toLowerCase()
            );
          });

        setMyProjects(filteredProjects);
      } catch (error: any) {
        console.error("Error fetching my projects:", error);
        // Attempt to extract revert reason
        const revertReason =
          error.reason || (error.data && error.data.message) || error.message;
        toast.error(`Failed to fetch your projects: ${revertReason}`);
      }
    },
    []
  ); // Dependencies for useCallback

  const fetchMyInvestments = useCallback(async (contractInstance: any) => {
    if (!contractInstance) {
      return; // Don't fetch if contract isn't loaded yet
    }
    try {
      let [investmentIds, investors, amounts, refundStatuses, projectIds]: [
        BigNumberish[],
        string[],
        BigNumberish[],
        boolean[],
        BigNumberish[]
      ] = await contractInstance.getAllInvestments(); // Note: Contract might return BigNumberish/boolean

      // Ensure all arrays have the same length before mapping
      if (
        investmentIds.length !== investors.length ||
        investmentIds.length !== amounts.length ||
        investmentIds.length !== refundStatuses.length ||
        investmentIds.length !== projectIds.length
      ) {
        console.error(
          "Mismatch in investment array lengths fetched from contract."
        );
        toast.error("Failed to fetch investment details due to data mismatch.");
        return;
      }

      const formatedData: InvestmentType[] = investmentIds.map(
        (_: any, i: number) => {
          return {
            investmentId: Number(investmentIds[i]), // Convert BigNumberish to Number
            projectId: Number(projectIds[i]), // Convert BigNumberish to Number
            investor: investors[i],
            amount: Number(amounts[i]), // Convert BigNumberish to Number
            refundStatuse: refundStatuses[i],
          };
        }
      );
      setformatedData(formatedData);
    } catch (error: any) {
      console.error("Error fetching investments:", error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to fetch investments: ${revertReason}`);
    }
  }, []); // Dependencies for useCallback

  useEffect(() => {
    const handleConnect = async () => {
      try {
        const windowObj = window as any;
        if (!windowObj.ethereum) {
          toast.error("MetaMask or a compatible wallet is not installed!");
          return;
        }

        const provider = new ethers.BrowserProvider(windowObj.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length === 0) {
          toast.error("Please connect to your wallet.");
          return;
        }
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(
          crowdFunding_address,
          crowdFunding_abi,
          signer
        );

        setAddress(address);
        setContract(contract);
        setWallet(address); // Initialize wallet state with connected address

        // Fetch initial data using the defined functions
        await fetchMyProjects(contract, address);
        await fetchMyInvestments(contract);
      } catch (error: any) {
        console.error(
          "Error connecting to wallet or fetching initial data:",
          error
        );
        toast.error(
          `Failed to connect or fetch data: ${error.message || error}`
        );
      }
    };

    handleConnect();
  }, [fetchMyProjects, fetchMyInvestments]); // Add fetch functions as dependencies for useEffect

  // Refetch data after a successful transaction - now using the external functions
  const refetchData = async () => {
    if (contract && address) {
      await fetchMyProjects(contract, address);
      await fetchMyInvestments(contract);
    }
  };

  const handleCreate = async () => {
    if (!contract) {
      toast.error("Wallet not connected or contract not loaded.");
      return;
    }
    if (!wallet) {
      toast.error("Please enter a wallet address.");
      return;
    }
    try {
      toast.loading("Creating project...");
      const tx = await contract.addProject(wallet);
      const receipt = await tx.wait();
      toast.dismiss(); // Dismiss loading toast
      if (receipt && receipt.status === 1) {
        toast.success("Project created successfully!");
        await refetchData(); // Refetch data after successful creation
      } else {
        toast.error("Project creation failed.");
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to create project: ${revertReason}`);
    }
  };

  const handleStartInvestment = async () => {
    if (!contract) {
      toast.error("Wallet not connected or contract not loaded.");
      return;
    }
    if (
      !projectIdForStartInvestment ||
      !goalAmountForStartInvestment ||
      !yourDepositForStartInvestment ||
      !deadlineForStartInvestment ||
      !profitSharingRatioForStartInvestment
    ) {
      toast.error("Please fill in all fields to start an investment round.");
      return;
    }
    // Basic input validation
    const projectIdNum = parseInt(projectIdForStartInvestment, 10);
    const goalAmountNum = parseFloat(goalAmountForStartInvestment); // Use parseFloat for potential decimals
    const merchantDepositNum = parseFloat(yourDepositForStartInvestment);
    const deadlineNum = parseInt(deadlineForStartInvestment, 10);
    const profitSharingRatioNum = parseInt(
      profitSharingRatioForStartInvestment,
      10
    );

    if (isNaN(projectIdNum) || projectIdNum < 0) {
      toast.error("Invalid Project ID.");
      return;
    }
    if (isNaN(goalAmountNum) || goalAmountNum <= 0) {
      toast.error("Invalid Goal Amount.");
      return;
    }
    if (isNaN(merchantDepositNum) || merchantDepositNum < 0) {
      toast.error("Invalid Your Deposit amount.");
      return;
    }
    if (isNaN(deadlineNum) || deadlineNum <= 0) {
      toast.error("Invalid Deadline.");
      return;
    }
    if (
      isNaN(profitSharingRatioNum) ||
      profitSharingRatioNum < 0 ||
      profitSharingRatioNum > 100
    ) {
      toast.error(
        "Invalid Profit Sharing Ratio (should be between 0 and 100)."
      );
      return;
    }

    try {
      // Convert values to appropriate BigNumber formats
      const goalAmountWei = ethers.parseEther(goalAmountForStartInvestment);
      const merchantDepositWei = ethers.parseEther(
        yourDepositForStartInvestment
      );
      const deadlineTimestamp = BigInt(deadlineNum); // Assuming deadline is a timestamp or similar number
      const profitSharingRatioBigInt = BigInt(profitSharingRatioNum);

      toast.loading("Starting investment round...");
      const tx = await contract.startInvestmentRound(
        BigInt(projectIdNum), // Pass as BigInt
        goalAmountWei,
        deadlineTimestamp,
        profitSharingRatioBigInt,
        { value: merchantDepositWei } // Send deposit as value
      );

      const receipt = await tx.wait();
      toast.dismiss(); // Dismiss loading toast

      if (receipt && receipt.status === 1) {
        toast.success("Project Investment Round Started!");
        // Clear form fields on success
        setprojectIdForStartInvestment("");
        setgoalAmountForStartInvestment("");
        setyourDepositForStartInvestment("");
        setdeadlineForStartInvestment("");
        setprofitSharingRatioForStartInvestment("");
        await refetchData(); // Refetch data after successful start
      } else {
        toast.error("Failed to start investment round.");
      }
    } catch (error: any) {
      console.error("Error starting investment round:", error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to start investment round: ${revertReason}`);
    }
  };

  const handleEndInvestment = async () => {
    if (!contract) {
      toast.error("Wallet not connected or contract not loaded.");
      return;
    }
    if (!projectIdForEndInvestment) {
      toast.error("Please enter the project ID to end the investment round.");
      return;
    }
    // Basic input validation
    const projectIdNum = parseInt(projectIdForEndInvestment, 10);
    if (isNaN(projectIdNum) || projectIdNum < 0) {
      toast.error("Invalid Project ID.");
      return;
    }

    try {
      toast.loading("Ending investment round...");
      const tx = await contract.endInvestmentRound(BigInt(projectIdNum)); // Pass as BigInt
      const receipt = await tx.wait();
      toast.dismiss(); // Dismiss loading toast

      if (receipt && receipt.status === 1) {
        toast.success("Project Investment Round Ended!");
        setprojectIdForEndInvestment(""); // Clear field on success
        await refetchData(); // Refetch data after successful end
      } else {
        toast.error("Failed to end investment round.");
      }
    } catch (error: any) {
      console.error("Error ending investment round:", error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to end investment round: ${revertReason}`);
    }
  };

  const handleProfitDistribution = async () => {
    if (!contract) {
      toast.error("Wallet not connected or contract not loaded.");
      return;
    }
    if (!projectIdForProfitDistribution || !profitAmount) {
      toast.error("Please enter the project ID and profit amount.");
      return;
    }
    // Basic input validation
    const projectIdNum = parseInt(projectIdForProfitDistribution, 10);
    const profitAmountNum = parseFloat(profitAmount);

    if (isNaN(projectIdNum) || projectIdNum < 0) {
      toast.error("Invalid Project ID.");
      return;
    }
    if (isNaN(profitAmountNum) || profitAmountNum <= 0) {
      toast.error("Invalid Profit Amount.");
      return;
    }

    try {
      const profitAmountWei = ethers.parseEther(profitAmount);

      toast.loading("Distributing profits...");
      const tx = await contract.distributeProfits(
        BigInt(projectIdNum), // Pass as BigInt
        { value: profitAmountWei } // Send profit amount as value
      );
      const receipt = await tx.wait();
      toast.dismiss(); // Dismiss loading toast

      if (receipt && receipt.status === 1) {
        toast.success("Profit Distribution Done!");
        setprojectIdForProfitDistribution(""); // Clear fields on success
        setprofitAmount("");
        await refetchData(); // Refetch data after successful distribution
      } else {
        toast.error("Profit distribution failed.");
      }
    } catch (error: any) {
      console.error("Error distributing profits:", error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to distribute profits: ${revertReason}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!contract) {
      toast.error("Wallet not connected or contract not loaded.");
      return;
    }
    try {
      toast.loading(`Deleting project ${id}...`);
      const tx = await contract.deleteProject(BigInt(id)); // Pass as BigInt
      const receipt = await tx.wait();
      toast.dismiss(); // Dismiss loading toast

      if (receipt && receipt.status === 1) {
        toast.success(`Project ${id} deleted successfully!`);
        await refetchData(); // Refetch data after successful deletion
      } else {
        toast.error(`Project ${id} deletion failed.`);
      }
    } catch (error: any) {
      console.error(`Error deleting project ${id}:`, error);
      // Attempt to extract revert reason
      const revertReason =
        error.reason || (error.data && error.data.message) || error.message;
      toast.error(`Failed to delete project ${id}: ${revertReason}`);
    }
  };

  // This function is called initially in useEffect and also when the button is clicked
  const handleFetchMyInvestmentsClick = async () => {
    if (contract) {
      await fetchMyInvestments(contract);
    } else {
      toast.error("Wallet not connected or contract not loaded.");
    }
  };

  return (
    <div className="text-white p-5 md:p-10 flex flex-col gap-5 items-center justify-center bg-[#2a2a2a]">
      <Toaster /> {/* Place Toaster here to display toasts */}
      <Heading>Merchant</Heading>
      {/* Profile section with Transaction History button */}
      <div className="flex items-center gap-4 mb-4 w-full justify-end">
        <div className="bg-[#fff2] rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="font-semibold">Wallet:</span>
          <span className="truncate max-w-[160px]">
            {address
              ? `${address.slice(0, 8)}...${address.slice(-6)}`
              : "Not connected"}
          </span>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          onClick={() => setIsTransactionModalOpen(true)}
        >
          View Transaction History
        </button>
      </div>
      <TransactionHistoryModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactions={formatedData}
      />
      <div className="flex gap-5 w-full">
        <div className="grid grid-cols-2 gap-5 items-center justify-center w-1/2">
          {/* create a new project */}
          <div className="flex flex-col w-full h-full bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
            <SmallHeading>Create A New Project</SmallHeading>
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter your wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
            {/* Added null check for contract before enabling click */}
            <div
              className="mt-auto"
              onClick={
                contract
                  ? handleCreate
                  : () => toast.error("Wallet not connected.")
              }
            >
              <SlidingBgButton title="Create" />
            </div>
          </div>
          {/* start investment */}{" "}
          <div className="flex flex-col w-full h-full bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
            <SmallHeading>Start Investment</SmallHeading>
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter your project ID"
              value={projectIdForStartInvestment}
              onChange={(e) => setprojectIdForStartInvestment(e.target.value)}
            />
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter the goal amount (in ETH)"
              value={goalAmountForStartInvestment}
              onChange={(e) => setgoalAmountForStartInvestment(e.target.value)}
            />
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter your deposit (in ETH)"
              value={yourDepositForStartInvestment}
              onChange={(e) => setyourDepositForStartInvestment(e.target.value)}
            />
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter the project deadline (timestamp or block number)"
              value={deadlineForStartInvestment}
              onChange={(e) => setdeadlineForStartInvestment(e.target.value)}
            />
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter the profit sharing ratio (0-100)"
              value={profitSharingRatioForStartInvestment}
              onChange={(e) =>
                setprofitSharingRatioForStartInvestment(e.target.value)
              }
            />
            {/* Added null check for contract before enabling click */}
            <div
              className="mt-auto"
              onClick={
                contract
                  ? handleStartInvestment
                  : () => toast.error("Wallet not connected.")
              }
            >
              <SlidingBgButton title="Start Investment" />
            </div>
          </div>
          {/* end investment */}
          <div className="flex flex-col w-full w-full h-full bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
            <SmallHeading>End Investment</SmallHeading>
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter the project ID"
              value={projectIdForEndInvestment}
              onChange={(e) => setprojectIdForEndInvestment(e.target.value)}
            />
            {/* Added null check for contract before enabling click */}
            <div
              className="mt-auto"
              onClick={
                contract
                  ? handleEndInvestment
                  : () => toast.error("Wallet not connected.")
              }
            >
              <SlidingBgButton title="End Investment" />
            </div>
          </div>
          {/* distribute profits */}
          <div className="flex flex-col w-full h-full bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
            <SmallHeading>Distribute Profits</SmallHeading>
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter your project ID"
              value={projectIdForProfitDistribution}
              onChange={(e) =>
                setprojectIdForProfitDistribution(e.target.value)
              }
            />
            <input
              className="w-full mb-3 bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter the profit amount (in ETH)"
              value={profitAmount}
              onChange={(e) => setprofitAmount(e.target.value)}
            />
            {/* Added null check for contract before enabling click */}
            <div
              className="mt-auto"
              onClick={
                contract
                  ? handleProfitDistribution
                  : () => toast.error("Wallet not connected.")
              }
            >
              <SlidingBgButton title="Distribute Profits" />
            </div>
          </div>
        </div>
        {/* my projects */}
        <div className="flex flex-col bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10 w-1/2">
          <SmallHeading>My Projects</SmallHeading>
          <div className="flex flex-col items-center justify-center gap-5 overflow-y-auto">
            {myProjects.length > 0 ? (
              myProjects.map((project: CrowdfundingProjectType) => {
                const isExpanded = expandedProjectId === project.projectId;
                return (
                  <div
                    key={project.projectId}
                    className="w-full bg-[#00000032] rounded-xl shadow-lg shadow-black p-5 md:p-5"
                  >
                    {/* Project header - always visible */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(project.projectId)}
                    >
                      <div>
                        <p className="font-semibold">
                          Project ID: {project.projectId}
                        </p>
                        <p className="text-sm truncate max-w-[200px]">
                          {project.projectWallet.slice(0, 10)}...
                          {project.projectWallet.slice(-8)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="mr-2">
                          {ethers.formatEther(BigInt(project.amountRaised))}/
                          {ethers.formatEther(BigInt(project.goalAmount))} ETH
                        </p>
                        <span
                          className="text-2xl transform transition-transform duration-200 ease-in-out"
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Expandable content */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-[#ffffff33] pt-4">
                        <p className="mt-2">
                          Project Wallet: {project.projectWallet}
                        </p>
                        <p className="mt-2">
                          Goal Amount:{" "}
                          {ethers.formatEther(BigInt(project.goalAmount))} ETH
                        </p>
                        <p className="mt-2">
                          Merchant Deposit:{" "}
                          {ethers.formatEther(BigInt(project.merchantDeposit))}{" "}
                          ETH
                        </p>
                        <p className="mt-2">
                          Amount Raised:{" "}
                          {ethers.formatEther(BigInt(project.amountRaised))} ETH
                        </p>
                        <p className="mt-2">Deadline: {project.deadline}</p>
                        <p className="mt-2">
                          Profit Sharing Ratio:{" "}
                          {project.profitSharingRatio !== undefined &&
                          project.profitSharingRatio !== 0
                            ? project.profitSharingRatio
                            : "Not yet decided"}
                        </p>
                        <div className="flex mt-2 gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs ${
                              project.investmentRoundIsActive
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          >
                            Investment Round:{" "}
                            {project.investmentRoundIsActive
                              ? "Active"
                              : "Inactive"}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs ${
                              project.profitDistributionIsDone
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          >
                            Profit Distribution:{" "}
                            {project.profitDistributionIsDone
                              ? "Done"
                              : "Pending"}
                          </div>
                        </div>

                        {/* Delete button */}
                        <div
                          className="mt-4"
                          onClick={
                            contract
                              ? () => handleDelete(project.projectId)
                              : () => toast.error("Wallet not connected.")
                          }
                        >
                          <SlidingBgButton title="Delete" color="000" />
                        </div>

                        {/* Investments for this project */}
                        <div className="mt-4">
                          {formatedData.filter(
                            (inv) => inv.projectId === project.projectId
                          ).length > 0 ? (
                            <div>
                              <h4 className="text-md font-semibold mt-2 mb-2">
                                Investments for this project:
                              </h4>
                              {formatedData
                                .filter(
                                  (inv) => inv.projectId === project.projectId
                                )
                                .map((investment: InvestmentType) => {
                                  return (
                                    <div
                                      key={investment.investmentId}
                                      className="my-3 bg-[#fff2] rounded-xl shadow-lg shadow-black p-4 text-sm"
                                    >
                                      <p>
                                        Investment ID: {investment.investmentId}
                                      </p>
                                      <p>
                                        Investor:{" "}
                                        {investment.investor.slice(0, 10)}...
                                        {investment.investor.slice(-8)}
                                      </p>
                                      <p>
                                        Amount:{" "}
                                        {ethers.formatEther(
                                          BigInt(investment.amount)
                                        )}{" "}
                                        ETH
                                      </p>
                                      <p>
                                        Status:{" "}
                                        {investment.refundStatuse
                                          ? "Refunded"
                                          : "Not Refunded"}
                                      </p>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p className="text-center mt-3">
                              No investments found for this project.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No projects found for this address.</p>
            )}
          </div>
          {/* Fetch Investments button */}
          <div onClick={handleFetchMyInvestmentsClick} className="mt-4">
            <SlidingBgButton title="Fetch All Investments" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merchant;
