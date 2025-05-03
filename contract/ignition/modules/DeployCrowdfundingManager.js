const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployCrowdfundingManager", (m) => {
  const crowdfundingManager = m.contract("CrowdfundingManager");

  // Add any calls to the contract if necessary, for example:
  // m.call(donationManager, "someFunction", [arg1, arg2]);

  return { crowdfundingManager };
});