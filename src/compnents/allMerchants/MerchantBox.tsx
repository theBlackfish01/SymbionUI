import React from 'react'

interface MerchantType {
    id: number;
    wallet: string;
    reputationPoints: number;
    successfulProjects: number;
    failedProjects: number;
    totalInvestments: number;
    isActive: boolean;
  }
const MerchantBox = ({props} : {props:MerchantType}) => {
  console.log(props);
  return (
    <div>
        {props.id != 0 ? 
        <div
        className="bg-[#ffffff18] px-5 py-10 shadow-black rounded-lg shadow-lg m-3 text-white w-fit"
      >
      <p>ID: {props.id}</p>
      <p>Wallet Address: {props.wallet}</p>
      <p>Active: {props.isActive == true ? 'Yes' : 'No'}</p>
      <p>Reputaion Points: {props.reputationPoints}</p>
      <p>Total Investments: {props.totalInvestments}</p>
      <p>Successful Projects: {props.successfulProjects}</p>
      <p>Failed Projects: {props.failedProjects}</p>
  </div>
  : ''}
    </div>
  )
}

export default MerchantBox