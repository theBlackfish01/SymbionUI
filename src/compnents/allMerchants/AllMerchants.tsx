import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react'
import { crowdFunding_abi, crowdFunding_address } from '../../lib/abi';
import Heading from '../../ui/Heading';
import MerchantBox from './MerchantBox';

interface MerchantType {
    id: number;
    wallet: string;
    reputationPoints: number;
    successfulProjects: number;
    failedProjects: number;
    totalInvestments: number;
    isActive: boolean;
  }
  
const AllMerchants = () => {
    const [crowdFundingContract, setcrowdFundingContract] = useState<any>();
    const [address, setAddress] = useState("");
    const [merchants, setMerchants] = useState<MerchantType[]>([])
    const fetchAllMerchants = async()=>{
       if(crowdFundingContract){
        let [merchantIds, merchantWalletss, reputationPointss, successfulProjectss, failedProjectss, totalInvestmentss, isActives] = await crowdFundingContract.getAllMerchants()

        merchantIds = merchantIds.map((item:any)=>{
            return Number(item)
        })
        merchantWalletss = merchantWalletss.map((item:any)=>{
            return item
        })
        reputationPointss = reputationPointss.map((item:any)=>{
            return Number(item)
        })
        successfulProjectss = successfulProjectss.map((item:any)=>{
            return Number(item)
        })
        failedProjectss = failedProjectss.map((item:any)=>{
            return Number(item)
        })
        totalInvestmentss = totalInvestmentss.map((item:any)=>{
            return Number(item)
        })
        isActives = isActives.map((item:any)=>{
            return item
        })

        const formattedMerchant = merchantIds.map((_:any, i:number)=>{
            return{
                id: merchantIds[i],
                wallet: merchantWalletss[i],
                reputationPoints: reputationPointss[i],
                successfulProjects: successfulProjectss[i],
                failedProjects: failedProjectss[i],
                totalInvestments: totalInvestmentss[i],
                isActive: isActives[i],
            }
        })
        setMerchants(formattedMerchant)
       }
    }
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

        let [merchantIds, merchantWalletss, reputationPointss, successfulProjectss, failedProjectss, totalInvestmentss, isActives] = await crowdFundingContract.getAllMerchants()

        merchantIds = merchantIds.map((item:any)=>{
            return Number(item)
        })
        merchantWalletss = merchantWalletss.map((item:any)=>{
            return item
        })
        reputationPointss = reputationPointss.map((item:any)=>{
            return Number(item)
        })
        successfulProjectss = successfulProjectss.map((item:any)=>{
            return Number(item)
        })
        failedProjectss = failedProjectss.map((item:any)=>{
            return Number(item)
        })
        totalInvestmentss = totalInvestmentss.map((item:any)=>{
            return Number(item)
        })
        isActives = isActives.map((item:any)=>{
            return item
        })

        const formattedMerchant = merchantIds.map((_:any, i:number)=>{
            return{
                id: merchantIds[i],
                wallet: merchantWalletss[i],
                reputationPoints: reputationPointss[i],
                successfulProjects: successfulProjectss[i],
                failedProjects: failedProjectss[i],
                totalInvestments: totalInvestmentss[i],
                isActive: isActives[i],
            }
        })
        setMerchants(formattedMerchant)
        setcrowdFundingContract(crowdFundingContract);
        
        setAddress(address);
      };
      handleConnect();
      fetchAllMerchants()
    }, []);
  return (
    <div className='p-5 md:p-10'>
        <Heading>All Merchants</Heading>
        {merchants.length > 1 ? <div className='flex flex-wrap items-center justify-center gap-5'>
            {merchants.map((merchant:MerchantType)=>{
                return(
                    <MerchantBox props = {merchant}/>
                )
            })}
        </div> : <p>No Registered Merchant</p>}
    </div>
  )
}

export default AllMerchants