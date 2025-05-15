"use client";
import React, { useEffect, useState } from "react";
import Heading from "../../ui/Heading";
import SlidingBgButton from "../../ui/SlidingBgButton";
import { BigNumberish, ethers } from "ethers";
import {
  crowdFunding_abi,
  crowdFunding_address,
  donationManager_abi,
  donationManager_address,
} from "../../lib/abi";
import CrowdfundingProjectBox from "./components/CrowdfundingProjectBox";
import FundraisingProjectBox from "./components/FundraisingProjectBox";

const Projects = () => {
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

  interface fundraisingProjectType {
    projectId: number;
    projectWallet: string;
    goalAmount: number;
    deadline: number;
    amountRaised: number;
  }
  const [selected, setSelected] = useState("crowdfunding");
  const [fundraisingProjects, setfundraisingProjects] = useState([]);
  const [crowdFundingProjects, setcrowdFundingProjects] = useState<
    CrowdfundingProjectType[]
  >([]);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crowdFundingContract, setcrowdFundingContract] = useState<any>();
  const [donationManagerContract, setdonationManagerContract] = useState<any>();

  // Toggle expansion of a project
  const toggleExpand = (projectId: number) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  useEffect(() => {
    const handleConnect = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const windowObj = window as any;

        if (!windowObj.ethereum) {
          setError(
            "MetaMask is not installed. Please install MetaMask to view projects."
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
        const donationManagerContract = new ethers.Contract(
          donationManager_address,
          donationManager_abi,
          signer
        );

        // Fetch fundraising projects
        let [
          frprojectIds,
          frprojectWallets,
          frgoalAmounts,
          frdeadlines,
          framountsRaised,
        ] = await donationManagerContract.getAllProjects();
        frprojectIds = frprojectIds.map((projectId: BigNumberish) => {
          return Number(projectId);
        });
        frprojectWallets = frprojectWallets.map((projectWallet: string) => {
          return projectWallet;
        });
        frgoalAmounts = frgoalAmounts.map((goalamount: BigNumberish) => {
          return Number(goalamount);
        });
        frdeadlines = frdeadlines.map((deadline: BigNumberish) => {
          return Number(deadline);
        });
        framountsRaised = framountsRaised.map((amountraised: BigNumberish) => {
          return Number(amountraised);
        });
        const formatedFrProjects = frprojectIds.map((_: any, i: number) => {
          return {
            projectId: frprojectIds[i],
            projectWallet: frprojectWallets[i],
            goalAmount: frgoalAmounts[i],
            deadline: frdeadlines[i],
            amountRaised: framountsRaised[i],
          };
        });
        setfundraisingProjects(formatedFrProjects);

        // Fetch crowdfunding projects
        let [cfProjectIds, cfProjectWallets] =
          await crowdFundingContract.getAllProjects();
        let [
          cfgoalAmounts,
          cfdeadlines,
          cfamountsRaised,
          cfprofitSharingRatios,
          cfmerchantDeposits,
          cfinvestmentRoundsActive,
          cfprofitDistributionsDone,
        ] = await crowdFundingContract.getAllInvestmentRoundDetails();

        cfProjectIds = cfProjectIds.map((projectId: BigNumberish) => {
          return Number(projectId);
        });
        cfProjectWallets = cfProjectWallets.map((projectWallet: string) => {
          return projectWallet;
        });
        cfgoalAmounts = cfgoalAmounts.map((goalamount: BigNumberish) => {
          return Number(goalamount);
        });
        cfdeadlines = cfdeadlines.map((deadline: BigNumberish) => {
          return Number(deadline);
        });
        cfamountsRaised = cfamountsRaised.map((amountraised: BigNumberish) => {
          return Number(amountraised);
        });
        cfprofitSharingRatios = cfprofitSharingRatios.map(
          (profitsharingratio: BigNumberish) => {
            return Number(profitsharingratio);
          }
        );
        cfmerchantDeposits = cfmerchantDeposits.map(
          (merchantdeposit: BigNumberish) => {
            return Number(merchantdeposit);
          }
        );
        cfinvestmentRoundsActive = cfinvestmentRoundsActive.map(
          (investmentRoundsActive: boolean) => {
            return investmentRoundsActive;
          }
        );
        cfprofitDistributionsDone = cfprofitDistributionsDone.map(
          (profitdistributiondone: boolean) => {
            return profitdistributiondone;
          }
        );
        const formatedCfProjects = cfProjectIds.map((_: any, i: number) => {
          return {
            projectId: cfProjectIds[i],
            projectWallet: cfProjectWallets[i],
            goalAmount: cfgoalAmounts[i],
            deadline: cfdeadlines[i],
            amountRaised: cfamountsRaised[i],
            profitSharingRatio: cfprofitSharingRatios[i],
            merchantDeposit: cfmerchantDeposits[i],
            investmentRoundIsActive: cfinvestmentRoundsActive[i],
            profitDistributionIsDone: cfprofitDistributionsDone[i],
          };
        });
        setcrowdFundingProjects(formatedCfProjects);
        setcrowdFundingContract(crowdFundingContract);
        setdonationManagerContract(donationManagerContract);
      } catch (err: any) {
        console.error("Error connecting to wallet or fetching data:", err);
        setError(
          err.message ||
            "Failed to fetch projects data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    handleConnect();
  }, []);

  const fethFrProjects = async () => {
    // Fundraising Projects
    if (donationManagerContract) {
      let [
        frprojectIds,
        frprojectWallets,
        frgoalAmounts,
        frdeadlines,
        framountsRaised,
      ] = await donationManagerContract.getAllProjects();
      frprojectIds = frprojectIds.map((projectId: BigNumberish) => {
        return Number(projectId);
      });
      frprojectWallets = frprojectWallets.map((projectWallet: string) => {
        return projectWallet;
      });
      frgoalAmounts = frgoalAmounts.map((goalamount: BigNumberish) => {
        return Number(goalamount);
      });
      frdeadlines = frdeadlines.map((deadline: BigNumberish) => {
        return Number(deadline);
      });
      framountsRaised = framountsRaised.map((amountraised: BigNumberish) => {
        return Number(amountraised);
      });
      const formatedFrProjects = frprojectIds.map((_: any, i: number) => {
        return {
          projectId: frprojectIds[i],
          projectWallet: frprojectWallets[i],
          goalAmount: frgoalAmounts[i],
          deadline: frdeadlines[i],
          amountRaised: framountsRaised[i],
        };
      });
      setfundraisingProjects(formatedFrProjects);
    } else {
      console.log("contract not found");
    }
  };

  const fetchCfProjects = async () => {
    // CrowdFunding Projects
    if (crowdFundingContract) {
      let [cfProjectIds, cfProjectWallets] =
        await crowdFundingContract.getAllProjects();
      let [
        cfgoalAmounts,
        cfdeadlines,
        cfamountsRaised,
        cfprofitSharingRatios,
        cfmerchantDeposits,
        cfinvestmentRoundsActive,
        cfprofitDistributionsDone,
      ] = await crowdFundingContract.getAllInvestmentRoundDetails();

      cfProjectIds = cfProjectIds.map((projectId: BigNumberish) => {
        return Number(projectId);
      });
      cfProjectWallets = cfProjectWallets.map((projectWallet: string) => {
        return projectWallet;
      });
      cfgoalAmounts = cfgoalAmounts.map((goalamount: BigNumberish) => {
        return Number(goalamount);
      });
      cfdeadlines = cfdeadlines.map((deadline: BigNumberish) => {
        return Number(deadline);
      });
      cfamountsRaised = cfamountsRaised.map((amountraised: BigNumberish) => {
        return Number(amountraised);
      });
      cfprofitSharingRatios = cfprofitSharingRatios.map(
        (profitsharingratio: BigNumberish) => {
          return Number(profitsharingratio);
        }
      );
      cfmerchantDeposits = cfmerchantDeposits.map(
        (merchantdeposit: BigNumberish) => {
          return Number(merchantdeposit);
        }
      );
      cfinvestmentRoundsActive = cfinvestmentRoundsActive.map(
        (investmentRoundsActive: boolean) => {
          return investmentRoundsActive;
        }
      );
      cfprofitDistributionsDone = cfprofitDistributionsDone.map(
        (profitdistributiondone: boolean) => {
          return profitdistributiondone;
        }
      );
      const formatedCfProjects = cfProjectIds.map((_: any, i: number) => {
        return {
          projectId: cfProjectIds[i],
          ProjectWallet: cfProjectWallets[i],
          goalAmount: cfgoalAmounts[i],
          deadline: cfdeadlines[i],
          amountRaised: cfamountsRaised[i],
          profitSharingRatio: cfprofitSharingRatios[i],
          merchantDeposit: cfmerchantDeposits[i],
          investmentRoundIsActive: cfinvestmentRoundsActive[i],
          profitDistributionIsDone: cfprofitDistributionsDone[i],
        };
      });
      setcrowdFundingProjects(formatedCfProjects);
    }
  };

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

    if (selected === "fundraising") {
      if (fundraisingProjects.length <= 1) {
        return (
          <div className="text-center p-10 bg-gray-800 bg-opacity-30 rounded-xl">
            <p className="text-xl">No fundraising projects found</p>
            <p className="text-gray-400 mt-2">
              No projects have been created yet.
            </p>
          </div>
        );
      }

      return (
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fundraisingProjects.map((project: fundraisingProjectType) => {
              if (project.projectId === 0) return null; // Skip if projectId is 0
              const isExpanded = expandedProjectId === project.projectId;
              return (
                <div
                  key={project.projectId}
                  className="bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 transition-all hover:shadow-md"
                >
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
                      <p className="mr-2 text-sm">
                        {ethers.formatEther(BigInt(project.amountRaised))}/
                        {ethers.formatEther(BigInt(project.goalAmount))} ETH
                      </p>
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
                      <FundraisingProjectBox props={project} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            <div onClick={fethFrProjects} className="w-fit mt-5">
              <SlidingBgButton title="Refresh" />
            </div>
          </div>
        </div>
      );
    } else {
      // Crowdfunding projects
      if (crowdFundingProjects.length <= 1) {
        return (
          <div className="text-center p-10 bg-gray-800 bg-opacity-30 rounded-xl">
            <p className="text-xl">No crowdfunding projects found</p>
            <p className="text-gray-400 mt-2">
              No projects have been created yet.
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {crowdFundingProjects.map((project: CrowdfundingProjectType) => {
              if (project.projectId === 0) return null; // Skip if projectId is 0
              const isExpanded = expandedProjectId === project.projectId;
              return (
                <div
                  key={project.projectId}
                  className={`bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 transition-all hover:shadow-md ${
                    isExpanded ? "" : "h-fit"
                  }`}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(project.projectId)}
                  >
                    <div>
                      <p className="font-semibold">
                        Project ID: {project.projectId}
                      </p>
                      {project.projectWallet &&
                        project.projectWallet.length > 10 && (
                          <p className="text-sm truncate max-w-[200px]">
                            {project.projectWallet.slice(0, 10)}...
                            {project.projectWallet.slice(-8)}
                          </p>
                        )}
                    </div>
                    <div className="flex items-center">
                      <div className="flex flex-col items-end mr-2">
                        <p className="text-sm">
                          {ethers.formatEther(BigInt(project.amountRaised))}/
                          {ethers.formatEther(BigInt(project.goalAmount))} ETH
                        </p>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            project.investmentRoundIsActive
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {project.investmentRoundIsActive
                            ? "Active"
                            : "Inactive"}
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
                      <CrowdfundingProjectBox props={project} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            <div onClick={fetchCfProjects} className="w-fit mt-5">
              <SlidingBgButton title="Refresh" />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div id="projects" className="p-5 md:p-10">
      <Heading>All Projects</Heading>
      <div className="flex gap-5 flex-wrap my-8">
        <div onClick={() => setSelected("fundraising")}>
          <SlidingBgButton title="Fundraising" selected={selected} />
        </div>
        <div onClick={() => setSelected("crowdfunding")}>
          <SlidingBgButton title="CrowdFunding" selected={selected} />
        </div>
      </div>
      {/* All Projects */}
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default Projects;
