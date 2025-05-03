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
  const provider = new ethers.BrowserProvider(windowObj.ethereum);
  const [investments, setInvestments] = useState<InvestmentType[]>([]);
  useEffect(() => {
    const fetchMyInvestments = async () => {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new Contract(
        crowdFunding_address,
        crowdFunding_abi,
        signer
      );
      let [projectIds, investmentIds, amounts, refundStatuses] =
        await contract.getProjectsInvestedByInvestor(address);
      projectIds = projectIds.map((item: BigNumberish) => {
        return Number(item);
      });
      investmentIds = investmentIds.map((item: BigNumberish) => {
        return Number(item);
      });
      amounts = amounts.map((item: BigNumberish) => {
        return Number(item);
      });
      refundStatuses = refundStatuses.map((item: boolean) => {
        return item;
      });
      const formatedData: InvestmentType[] = projectIds.map(
        (_: any, i: number) => {
          return {
            projectId: projectIds[i],
            investmentId: investmentIds[i],
            amount: amounts[i],
            refundStatuse: refundStatuses[i],
          };
        }
      );
      setInvestments(formatedData);
    };
    fetchMyInvestments();
  }, []);
  return (
    <div className="p-5 md:p-10">
      <Heading>My CrowdFunding Investments</Heading>
      {investments.length > 1 ? (
        <div className="flex flex-wrap gap-5 items-center justify-center" >
          {investments.map((investment: InvestmentType) => {
            return (
               <div>
                {investment.investmentId != 0 ?  <div className="w-full bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
                <p>Investment ID: {investment.investmentId}</p>
                <p>Project ID: {investment.projectId}</p>
                <p>Invested Amount: {investment.amount} ETH</p>
                <p>Refund Status: {investment.refundStatuse == true ? 'Refunded': 'Not Refunded'}</p>
              </div>: ''}
               </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center">No investments found</p>
      )}
    </div>
  );
};

export default MyInvestments;
