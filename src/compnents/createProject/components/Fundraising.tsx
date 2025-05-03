import React, { useEffect, useState } from 'react'
import SlidingBgButton from '../../../ui/SlidingBgButton';
import { useStore } from '../../../zustand/store';
import { Contract } from 'ethers';
import { contract_abi, contract_address } from '../../../lib/abi';
import SmallHeading from '../../../ui/SmallHeading';
import toast, { Toaster } from 'react-hot-toast';

const Fundraising = () => {

  const [connectedAccAddress, setConnectedAccAddress] = useState("");
  const [contract, setContract] = useState<any>();
  const [projectWallet, setProjectWallet] = useState(connectedAccAddress);
  const provider = useStore((state) => state.provider);
  const signer = useStore((state) => state.signer);

    useEffect(() => {
        const contract = new Contract(contract_address, contract_abi, signer)
        setContract(contract)
        const getAddress = async () => {
          const address = await signer.getAddress();
          setConnectedAccAddress(address);
          setProjectWallet(address);
        };
        if (signer) {
          getAddress();
        }
      }, [provider, signer]);
  const notify = () => toast.success('Project Created Successfully');

    const handleSubmit_Fundraising = async () => {
        if (projectWallet) {
          try {
            const tx = await contract.addProject(
              projectWallet,
              0
            );
            await tx.wait()
            // router.refresh()
            notify()
            console.log(
              "Successful with the inputs: ",
              projectWallet
            );
            setProjectWallet("");
          } catch (error) {
            console.error("Error adding project: ", error);
          }
        } else {
          console.log("Enter valid input", projectWallet);
        }
      };
  return (
    <div className="flex items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-5 my-10 bg-[#ffffff18] w-fit rounded-2xl p-10 shadow-lg shadow-black">
            <SmallHeading>FundRaising</SmallHeading>
            <Toaster/>
            <label
              htmlFor=""
              className="text-white text-xs font-light text-left"
            >
              Project Owner
            </label>
            <input
              onChange={(e) => {
                setProjectWallet(e.target.value);
              }}
              value={projectWallet}
              className="text-white placeholder:text-white w-[280px] md:w-[400px] lg:w-[500px] bg-transparent px-4 py-1 outline-none border-b-2 border-white"
              type="text"
              placeholder="Project Wallet"
            />
            <div onClick={handleSubmit_Fundraising}>
            <SlidingBgButton title="Submit"/>

            </div>
          </div>
        </div>
  )
}

export default Fundraising