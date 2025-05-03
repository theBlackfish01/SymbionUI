import { crowdFunding_abi, crowdFunding_address } from "../../lib/abi";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Heading from "../../ui/Heading";
import SlidingBgButton from "../../ui/SlidingBgButton";

const CrowdfundingManager = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [wallet, setWallet] = useState("");

  

  const [contract, setContract] = useState<any>();
  const [address, setAddress] = useState("");
  useEffect(() => {
    const handleConnect = async () => {
      const windowObj = window as any;
      const provider = new ethers.BrowserProvider(windowObj.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        crowdFunding_address,
        crowdFunding_abi,
        signer
      );
      setContract(contract);
      setAddress(address);

      setWallet(address);
      const isMerchantRegistered = async () => {
        if (contract) {
          const tx = await contract.isMerchantRegistered(address);
          setIsRegistered(tx);
        } else {
          console.log("contract not found");
        }
      };
      isMerchantRegistered();
    };
    handleConnect();
  }, [isRegistered]);

  const fetchAllMerchants = async () => {
    try {
      setLoading(true);
      const merchantsData = await contract.getAllMerchants();
      const merchantList = [];

      for (let i = 0; i < merchantsData[0].length; i++) {
        merchantList.push({
          merchantId: merchantsData[0][i].toString(),
          merchantWallet: merchantsData[1][i],
          reputationPoints: merchantsData[2][i].toString(),
          successfulProjects: merchantsData[3][i].toString(),
          failedProjects: merchantsData[4][i].toString(),
          totalInvestments: merchantsData[5][i].toString(),
          isActive: merchantsData[6][i],
        });
      }

      setMerchants(merchantList);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      alert("Failed to fetch merchants.");
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async()=>{
    const tx = await contract.addMerchant()
    await tx.wait()
    setIsRegistered(true)
    console.log("Merchant registered with wallet ", wallet);
  }
  return (
    <div className="flex items-center justify-center p-5 md:p-10 h-screen text-white">
      <div className="bg-[#fff2] rounded-xl shadow-lg shadow-black p-5 md:p-10">
        <Heading>Login</Heading>
        {contract? <div>{isRegistered == false ? (
            <div className="flex flex-col gap-3">
              <p>You aren't a registered merchant. Please register now!</p>
            <input
            className="w-full bg-transparent outline-none border-b-[1px] border-white p-2 text-white placeholder:text-white"
              type="text"
              placeholder="Enter your wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              readOnly
            />
            <div onClick={handleRegister}>
                <SlidingBgButton title="Register"/>
            </div>
          </div>
        ) : (
          <div className="flex flex-col  gap-3">
            <p>Your'e a registered merchant! Please Login</p>
            <Link to={`./${address}`}>
                <SlidingBgButton title="Login"/>
            </Link>
          </div>
        )}</div>: <p>Loading....</p>}
      </div>
    </div>
  );
};

export default CrowdfundingManager;
