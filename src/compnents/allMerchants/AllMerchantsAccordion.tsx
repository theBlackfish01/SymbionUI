import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { crowdFunding_abi, crowdFunding_address } from "../../lib/abi";
import Heading from "../../ui/Heading";
import SlidingBgButton from "../../ui/SlidingBgButton";

interface MerchantType {
  id: number;
  wallet: string;
  reputationPoints: number;
  successfulProjects: number;
  failedProjects: number;
  totalInvestments: number;
  isActive: boolean;
}

const AllMerchantsAccordion = () => {
  const [crowdFundingContract, setcrowdFundingContract] = useState<any>();
  const [merchants, setMerchants] = useState<MerchantType[]>([]);
  const [expandedMerchantId, setExpandedMerchantId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle expansion of a merchant
  const toggleExpand = (merchantId: number) => {
    setExpandedMerchantId(
      expandedMerchantId === merchantId ? null : merchantId
    );
  };

  const fetchAllMerchants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (crowdFundingContract) {
        let [
          merchantIds,
          merchantWalletss,
          reputationPointss,
          successfulProjectss,
          failedProjectss,
          totalInvestmentss,
          isActives,
        ] = await crowdFundingContract.getAllMerchants();

        merchantIds = merchantIds.map((item: any) => {
          return Number(item);
        });
        merchantWalletss = merchantWalletss.map((item: any) => {
          return item;
        });
        reputationPointss = reputationPointss.map((item: any) => {
          return Number(item);
        });
        successfulProjectss = successfulProjectss.map((item: any) => {
          return Number(item);
        });
        failedProjectss = failedProjectss.map((item: any) => {
          return Number(item);
        });
        totalInvestmentss = totalInvestmentss.map((item: any) => {
          return Number(item);
        });
        isActives = isActives.map((item: any) => {
          return item;
        });

        const formattedMerchant = merchantIds.map((_: any, i: number) => {
          return {
            id: merchantIds[i],
            wallet: merchantWalletss[i],
            reputationPoints: reputationPointss[i],
            successfulProjects: successfulProjectss[i],
            failedProjects: failedProjectss[i],
            totalInvestments: totalInvestmentss[i],
            isActive: isActives[i],
          };
        });
        setMerchants(formattedMerchant);
      } else {
        setError(
          "Contract not connected. Please make sure your wallet is properly connected."
        );
      }
    } catch (err: any) {
      console.error("Error fetching merchants:", err);
      setError(
        err.message || "Failed to fetch merchants. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleConnect = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const windowObj = window as any;

        if (!windowObj.ethereum) {
          setError(
            "MetaMask is not installed. Please install MetaMask to view merchants."
          );
          setIsLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(windowObj.ethereum);
        const signer = await provider.getSigner();
        const crowdFundingContract = new ethers.Contract(
          crowdFunding_address,
          crowdFunding_abi,
          signer
        );

        let [
          merchantIds,
          merchantWalletss,
          reputationPointss,
          successfulProjectss,
          failedProjectss,
          totalInvestmentss,
          isActives,
        ] = await crowdFundingContract.getAllMerchants();

        merchantIds = merchantIds.map((item: any) => {
          return Number(item);
        });
        merchantWalletss = merchantWalletss.map((item: any) => {
          return item;
        });
        reputationPointss = reputationPointss.map((item: any) => {
          return Number(item);
        });
        successfulProjectss = successfulProjectss.map((item: any) => {
          return Number(item);
        });
        failedProjectss = failedProjectss.map((item: any) => {
          return Number(item);
        });
        totalInvestmentss = totalInvestmentss.map((item: any) => {
          return Number(item);
        });
        isActives = isActives.map((item: any) => {
          return item;
        });

        const formattedMerchant = merchantIds.map((_: any, i: number) => {
          return {
            id: merchantIds[i],
            wallet: merchantWalletss[i],
            reputationPoints: reputationPointss[i],
            successfulProjects: successfulProjectss[i],
            failedProjects: failedProjectss[i],
            totalInvestments: totalInvestmentss[i],
            isActive: isActives[i],
          };
        });
        setMerchants(formattedMerchant);
        setcrowdFundingContract(crowdFundingContract);
      } catch (err: any) {
        console.error("Error connecting to wallet or fetching data:", err);
        setError(
          err.message ||
            "Failed to fetch merchants data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    handleConnect();
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

    if (merchants.length <= 1) {
      return (
        <div className="text-center p-10 bg-gray-800 bg-opacity-30 rounded-xl">
          <p className="text-xl">No merchants found</p>
          <p className="text-gray-400 mt-2">
            No merchants have been registered yet.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {merchants.map((merchant: MerchantType) => {
            if (merchant.id === 0) return null; // Skip if id is 0
            const isExpanded = expandedMerchantId === merchant.id;
            return (
              <div
                key={merchant.id}
                className={`bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 transition-all ease-in-out hover:shadow-md ${
                  isExpanded ? "" : "h-fit"
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(merchant.id)}
                >
                  <div>
                    <p className="font-semibold">ID: {merchant.id}</p>
                    <p className="text-sm truncate max-w-[200px]">
                      {merchant.wallet.slice(0, 10)}...
                      {merchant.wallet.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex flex-col items-end mr-2">
                      <p className="text-sm">RP: {merchant.reputationPoints}</p>
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          merchant.isActive ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        {merchant.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <span
                      className="text-xl transform transition-transform duration-200 ease-in-out"
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

                {isExpanded && (
                  <div className="mt-4 border-t border-[#ffffff33] pt-4">
                    <div className="mt-2">
                      <p className="mb-2">
                        <span className="text-gray-400">Wallet:</span>{" "}
                        {merchant.wallet}
                      </p>
                      <p className="mb-2">
                        <span className="text-gray-400">
                          Reputation Points:
                        </span>{" "}
                        {merchant.reputationPoints}
                      </p>
                      <div className="flex gap-2 mb-2">
                        <div className="bg-green-500 bg-opacity-20 text-green-300 px-3 py-1 rounded-full">
                          Success: {merchant.successfulProjects}
                        </div>
                        <div className="bg-red-500 bg-opacity-20 text-red-300 px-3 py-1 rounded-full">
                          Failed: {merchant.failedProjects}
                        </div>
                      </div>
                      <p className="mb-2">
                        <span className="text-gray-400">
                          Total Investments:
                        </span>{" "}
                        {merchant.totalInvestments} ETH
                      </p>
                      <p className="mb-2">
                        <span className="text-gray-400">Status:</span>{" "}
                        <span
                          className={
                            merchant.isActive
                              ? "text-green-300"
                              : "text-red-300"
                          }
                        >
                          {merchant.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center mt-5">
          <div onClick={fetchAllMerchants} className="w-fit">
            <SlidingBgButton title="Refresh" />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-5 md:p-10">
      <Heading>All Merchants</Heading>
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default AllMerchantsAccordion;
