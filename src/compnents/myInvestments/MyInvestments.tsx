import React, { useEffect, useState } from "react";
import { useStore } from "../../zustand/store";
import { BigNumberish, Contract, ethers } from "ethers";
import { crowdFunding_abi, crowdFunding_address } from "../../lib/abi";
import Heading from "../../ui/Heading";

interface InvestmentType {
  projectId: number;
  investmentId: number;
  amount: number;
  refundStatuse: boolean;
}

const MyInvestments = () => {
  const windowObj = window as any;
  const [investments, setInvestments] = useState<InvestmentType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyInvestments = async () => {
      if (!windowObj.ethereum) {
        setError(
          "MetaMask is not installed. Please install MetaMask to view your investments."
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const provider = new ethers.BrowserProvider(windowObj.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const contract = new Contract(
          crowdFunding_address,
          crowdFunding_abi,
          signer
        );

        const [projectIds, investmentIds, amounts, refundStatuses] =
          await contract.getProjectsInvestedByInvestor(address);

        const formattedData: InvestmentType[] = projectIds
          .map((_: any, i: number) => {
            return {
              projectId: Number(projectIds[i]),
              investmentId: Number(investmentIds[i]),
              amount: Number(ethers.formatEther(amounts[i])), // Convert wei to ETH
              refundStatuse: refundStatuses[i],
            };
          })
          .filter(
            (investment: InvestmentType) => investment.investmentId !== 0
          );

        setInvestments(formattedData);
      } catch (err: any) {
        console.error("Error fetching investments:", err);
        setError(
          err.message ||
            "Failed to fetch your investments. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyInvestments();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-xl p-4 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (investments.length === 0) {
      return (
        <div className="text-center p-10 bg-gray-800 bg-opacity-30 rounded-xl">
          <p className="text-xl">No investments found</p>
          <p className="text-gray-400 mt-2">
            You have not invested in any crowdfunding projects yet.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {investments.map((investment: InvestmentType) => (
          <div
            key={`${investment.projectId}-${investment.investmentId}`}
            className="bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 transition-all hover:shadow-md hover:shadow-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full">
                ID: {investment.investmentId}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  investment.refundStatuse
                    ? "bg-green-500 bg-opacity-20 text-green-300"
                    : "bg-yellow-500 bg-opacity-20 text-yellow-300"
                }`}
              >
                {investment.refundStatuse ? "Refunded" : "Not Refunded"}
              </span>
            </div>
            <p className="mb-2">
              <span className="text-gray-400">Project ID:</span>{" "}
              {investment.projectId}
            </p>
            <p className="mb-2">
              <span className="text-gray-400">Invested Amount:</span>{" "}
              {investment.amount.toFixed(4)} ETH
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 md:p-10">
      <Heading>My CrowdFunding Investments</Heading>
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default MyInvestments;
