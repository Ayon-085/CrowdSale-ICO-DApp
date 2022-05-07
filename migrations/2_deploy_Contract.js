const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = async function (deployer) {
  //Token Price is 0.001 ether
  const tokenPrice = 1000000000000000; 
  deployer.deploy(DappToken, 1000000).then(()=>{
      return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};

//0x4A5c8e1B2919A1F6932C6063AD5130adb9e0A73f (metamask address)