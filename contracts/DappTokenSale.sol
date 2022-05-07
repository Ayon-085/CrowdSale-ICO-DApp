pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale{
    //state variables
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor (DappToken _tokenContract, uint256 _tokenPrice) {
        //assign an admin
        admin = msg.sender;
        //Token Contract
        tokenContract = _tokenContract;
        //Token Price
        tokenPrice = _tokenPrice;
    }

    //multiply
     function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }


    //Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {

        //require that contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        //require that value is equal to tokens
        require(msg.value == mul(_numberOfTokens, tokenPrice));
        //require that a transfer is successful        
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //keep track of tokens Sold
        tokensSold += _numberOfTokens;
        //trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    //Ending Token DappTokenSale 
    function endSale() public {
        //require admin
        require(msg.sender == admin);
        //transfer remaining dapptoken to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //destroy contract
        //selfdestruct(payable(admin)); //or address payable addr = payable(address(admin)) -> selfDestruct(addr);
        address payable addr = payable(address(admin));
        payable(admin).transfer(address(addr).balance);
    }
}