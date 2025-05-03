require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    vanar:{
      url: "https://rpc-vanguard.vanarchain.com	",
      accounts: process.env.PRIVATE_KEY? [process.env.PRIVATE_KEY] : [],
    }
  }
};
