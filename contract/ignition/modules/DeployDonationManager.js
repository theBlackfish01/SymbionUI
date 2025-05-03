const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployDonationManager", (m) => {
  const donationManager = m.contract("DonationManager");

  // Add any calls to the contract if necessary, for example:
  // m.call(donationManager, "someFunction", [arg1, arg2]);

  return { donationManager };
});