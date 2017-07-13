// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {
  default as Web3
} from 'web3';
import {
  default as contract
} from 'truffle-contract'

var QRCode = require('qrcode')

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'
import simpleticket_artifacts from '../../build/contracts/SimpleTicket.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);
var SimpleTicket = contract(simpleticket_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);
    SimpleTicket.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshStats();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

    signMessage: function() {
      var message = document.getElementById("messageToSign").value;
      var signedMessageElement = document.getElementById("signedMessage");
      var signedMessageQRElement = document.getElementById("signedMessageQR");
      var hash = web3.sha3(message);
      var signedMsg = web3.eth.sign(account, hash);
      signedMessageElement.innerHTML = signedMsg;

      QRCode.toCanvas(signedMessageQR, signedMsg, function(error) {
        if (error) console.error(error)
        console.log('success!');
      })
    },
      verifyMessage: function() {
        var message = document.getElementById("messageToVerify").value;
        var address = document.getElementById("addressToVerify").value;
        var messageVerificationResult = document.getElementById("MessageVerificationResult");
        
        var hash = web3.sha3(message);
        var signedMsg = web3.eth.sign(account, hash);
        signedMessageElement.innerHTML = signedMsg;

        QRCode.toCanvas(signedMessageQR, signedMsg, function(error) {
          if (error) console.error(error)
          console.log('success!');
        })
      },

  refreshStats: function() {
    var self = this;

    var meta;
    SimpleTicket.deployed().then(function(instance) {
      meta = instance;
      return meta.totalTickets.call();
    }).then(function(value) {
      var totalTicketsSold_element = document.getElementById("totalTickets");
      totalTicketsSold_element.innerHTML = value.toNumber();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting totalTickets; see log.");
    });

    SimpleTicket.deployed().then(function(instance) {
      meta = instance;
      return meta.ticketPrice.call();
    }).then(function(value) {
      var ticketPrice_element = document.getElementById("ticketPrice");
      ticketPrice_element.innerHTML = value.toNumber();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting ticketPrice; see log.");
    });

    SimpleTicket.deployed().then(function(instance) {
      meta = instance;
      return meta.getUserTicketCount.call();
    }).then(function(value) {
      var totalTicketsSold_element = document.getElementById("totalTicketsSold");
      totalTicketsSold_element.innerHTML = value;
      console.log(value);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting totalTicketsSold; see log.");
    });


  },

  buyTickets: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Buying tickets... (please wait)");

    var meta;
    SimpleTicket.deployed().then(function(instance) {
      meta = instance;
      return meta.purchaseTicket(amount, {
        from: account,
        gas: 1000000,
        value: web3.toWei(1, 'ether')
      });
    }).then(function(val) {
      self.setStatus("Transaction " + val);
      self.refreshStats();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error buying tickets; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
