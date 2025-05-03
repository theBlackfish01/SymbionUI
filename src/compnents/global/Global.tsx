import React from "react";
import SmallHeading from "../../ui/SmallHeading";
import { GlobeDemo } from "./Globe";

const Global = () => {
  return (
    <div>
      <SmallHeading>Fund your project globally</SmallHeading>
      <p className="capitalize font-light text-xs tracking-[5px] text-white text-center">
        Expand your reach with international investors
      </p>
      <GlobeDemo/>
    </div>
  );
};

export default Global;
