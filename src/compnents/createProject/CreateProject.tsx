import React from "react";
import SmallHeading from "../../ui/SmallHeading";
import Heading from "../../ui/Heading";
import SlidingBgButton from "../../ui/SlidingBgButton";
import { Link } from "react-router-dom";
import LoginBox from "./components/LoginBox";

const CreateProject = () => {
  return (
    <div id="create" className="p-5 md:p-10">
      <Heading>Create A Project</Heading>
      
      <div className="flex items-center justify-around gap-5" >
        <LoginBox text="Fuel your global expansion with worldwide funding" btnPath="/fundraiserLogin" btnText="Become a Fundraiser"/>
        <LoginBox text="Tap into global markets with global investment" btnPath="/merchantLogin" btnText="Become a Merchant"/>
      </div>
    </div>
  );
};

export default CreateProject;
