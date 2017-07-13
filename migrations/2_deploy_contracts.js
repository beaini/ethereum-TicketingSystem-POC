var SimpleTicket = artifacts.require("./SimpleTicket.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleTicket, 100, 50);
};
