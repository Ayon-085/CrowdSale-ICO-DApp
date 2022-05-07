App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    saleAddr: '0x0',
    init: function(){
        console.log("App initialized");
        return App.initWeb3();
    },

    initWeb3: async function(){
        if(window.ethereum) {
            App.web3Provider = window.ethereum;
            console.log('ppp');
            //console.log(App.web3Provider);
            try{
                //await ethereum.enable();
                //await window.ethereum.enable();
               const accountAddress = await ethereum.request({method:'eth_requestAccounts'});
               console.log(accountAddress);
            } catch(error) {
                console.log("error is "+error);
                //console.error("User denied the account access");
            }   
        }

        else if(window.web3){
            //console.log('ppp4');
            App.web3Provider = window.web3.currentProvider;
        }

        else{
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
        }

        web3 = new Web3(App.web3Provider);


        return App.initContract();
    },


    initContract: function() {
         $.getJSON("DappTokenSale.json", function(dappTokenSale){
            console.log('p4'); 
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            //console.log(App.contracts.DappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(dappTokenSale=>{
                console.log(dappTokenSale.address);
            });
        }).done(()=>{
                $.getJSON("DappToken.json", (dappToken)=>{
                    console.log('p5');
                    App.contracts.DappToken = TruffleContract(dappToken);
                    //console.log(App.contracts.DappTokenSale);
                    App.contracts.DappToken.setProvider(App.web3Provider);
                    App.contracts.DappToken.deployed().then(dappToken=>{
                        console.log(dappToken.address);
                    });
                    console.log('p6');
                    App.listenForEvents();
                    console.log('p7');
                    return App.render();
                });
                //return App.render();
            });
            //return App.render();
    },

    listenForEvents: function(){
        App.contracts.DappTokenSale.deployed().then((instance)=>{
            console.log('p8');
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch((error, events)=>{
                console.log('p9');
                console.log("event triggered", events);
                App.render();
            });
        });
    },

    render: function() {
        if(App.loading){
            console.log('poked in...');
            console.log(App.loading);
            return;
        }
        console.log(App.loading+' hi');
        App.loading = true;

        var loader = $('#loader');
        var content = $("#content");

        loader.show();
        content.hide();


        //account data will be loaded here
        web3.eth.getCoinbase((err, account)=>{
            if(err === null) {
                App.account = account;
                $('#accountAddress').html("Your Account: "+ account);
            }
        });
        // App.loading = false;
        // loader.hide();
        // content.show();

        //Load Token-Sale Contract
        //let addr;
        App.contracts.DappTokenSale.deployed().then((instance)=>{
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then((tokenPrice)=>{
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber()+' ');
            return dappTokenSaleInstance.tokensSold();
        }).then((tokensSold)=>{
            App.tokensSold = tokensSold.toNumber();
            //App.tokensSold = 30000;
            $('.tokens-sold').html(App.tokensSold);
            console.log(App.tokensSold);
            App.saleAddr = dappTokenSaleInstance.address;
            //$('.tokens-sold').html(App.tokensSold);
            //$('.tokens-available').html(App.tokensAvailable+' ');

            var progressPercent = (App.tokensSold/App.tokensAvailable)*100;
            console.log(progressPercent);
            $('#progress').css('width', progressPercent+'%');
        });

        

        //Load Token Contract
        App.contracts.DappToken.deployed().then((instance)=>{
            dappTokenInstance = instance;
            //console.log(instance.address);
            return dappTokenInstance.balanceOf(App.account);
        }).then((balance)=>{
            $('.dapp-balance').html(balance.toNumber());
            return dappTokenInstance.balanceOf(App.saleAddr);
        }).then((blnc)=>{
            $('.tokens-available').html(blnc.toNumber()+' ');
            console.log(blnc.toNumber());
            console.log(App.saleAddr);
            App.loading = false;
            loader.hide();
            content.show();
        });
    },

    buyTokens: function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then((instance)=>{
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then((result)=>{
            console.log('Tokens bought........');
            $('form').trigger('reset');
            // $('#loader').hide();
            // $('#content').show();
        });
    }
        
        

};   

$(function() {
  $(window).load(function() {
    App.init();
  });
});