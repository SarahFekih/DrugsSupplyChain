//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var http = require('http')
var fs = require('fs');
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
const FabricCAServices = require('fabric-ca-client');
const helper = require('./helper')
const log4js = require('log4js');
var productObject = require('./models/product');
var orderObject = require('./models/order');
const order = require('./models/order');
const logger = log4js.getLogger('BasicNetwork');
var os = require('os');
const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
//const { Wallets } = require('fabric-network');


async function myFunction(user, password,mspid) {
	const walletPath = await helper.getWalletPath(mspid)
	fs.readFile(`${walletPath}/${user}.id`, (err, data) => {
		// Throw err. 
		if (err) throw err;
		JsonData = JSON.parse(data.toString())
		JsonData.password = password
		fs.writeFile(`${walletPath}/${user}.id`, JSON.stringify(JsonData), (err) => {
			 //throw err. 
			if (err) throw err;
		})
	})
}



module.exports = (function () {
	return {
		RegisterUser: async function (req, res) {
			//try {
			var array = req.params.user.split("-");
			var user = array[0]
			var password = array[1].toString()
			var Org = array[2].toString()
			console.log("Registring User: ");
			let response = await helper.getRegisteredUser(user, Org, true);

		setTimeout(function () {
				myFunction(user, password,Org);
			}, 1000);
		res.send(response)

		},



		SignInUser: async function (req, res) {
			try {
				console.log("Singn in User: ");
				var array = req.params.id.split("-");
				var user = array[0]
				var password = array[1]
				var mspid = array[2]				
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(mspid)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);
				const gateway = new Gateway();
				await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: false } });

				var Values = await helper.getUser(user,mspid)
				var _mspid=Values[0]
				var _password=Values[1]
				setTimeout(() => {  				
				if (_mspid != mspid || _password != password) {
						res.json("Failed to sign In this user ")
				} else res.json("Good") }, 2000);

				} catch (error) {
						console.error(`Failed to register user ${user}: ${error}`);
					}
				},

		//create a local product in order to get an incremental number and use it to create product on the blockchain 		
		CreateProduct: async function (req, res) {
			console.log("Creating product: ");
			//get product information and the connected user information
			username=req.params.user
			var org_name=req.params.mspid
			var Label = req.body.Label;
			var ManufacturingDate = req.body.ManufacturingDate;
			var ExpirationDate = req.body.ExpirationDate;
			var Manufacturer = req.body.Manufacturer;


			try {
				let ccp = await helper.getCCP(org_name)
				console.log(ccp);
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				console.log(connectOptions);
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');

				//create a database instance of the product containing non critical information 
				// and use the random generated ID to create the blockchain instance

			   product =new productObject({
					Label: Label,
					ManufacturingDate: ManufacturingDate,
					ExpirationDate : ExpirationDate,
					Manufacturer : Manufacturer,
					
				});
			
				//first step saving the product data in the DB and generate a unique id for it
				product.save(function(error,results) {
					if(error) {
						res.json({'success':false}); 
					}
					else{
						//if the  product created successfully, get the id =results._id
						id= (results._id).toString()
						//submit transaction the blockchain to create the product
						contract.submitTransaction('CreateProduct', id, Label, ManufacturingDate, ExpirationDate, Manufacturer);
						console.log('Transaction has been submitted');
					}
				})	
				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(product)
				return (product)

			} catch (error) {
				console.error(`Failed to submit transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));

			}
		},

		CreateOrder: async function (req, res) {
			console.log("Creating Order: ");
			//Get the order details, connected user and his organisation name
			var ProductID = req.body.ProductID;
			var DateOfDelivery = req.body.DateOfDelivery;
			username=req.params.user
			var org_name=req.params.mspid
			try {

				let ccp = await helper.getCCP(org_name)
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				//Create a  new order to the database and us the randomId to map with the blockchain instance
				//Only static information are saved to mongoDB
				orderN =new orderObject({
					ProductID: ProductID,
					DateOfDelivery: DateOfDelivery,
				});

				orderN.save(function(error,results) {
					if(error) {
						res.json({'success':false}); 
					}
					else{
						//if the order created successfully, get the id =results._id
						id= (results._id).toString()
						//save the order to the blockchain
						contract.submitTransaction('CreateOrder', id, ProductID, DateOfDelivery);
						console.log('Transaction has been submitted');
					
					}
				})	

				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(orderN)
				return (orderN)

			} catch (error) {
				console.error(`Failed to submit transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));
			}
		},

		SendOrder: async function (req, res) {
			console.log("SendOrder ");
			//Get the request information
			var OrderID = req.body.OrderID;
			username=req.params.user
			var org_name=req.params.mspid

			try {

				let ccp = await helper.getCCP(org_name)
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				result = await contract.submitTransaction('SendOrder', OrderID);
				console.log('Transaction has been submitted');
				var obj = JSON.parse(result);

				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(obj)
				return (obj)

			} catch (error) {
				console.error(`Failed to submit transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));
			}
		},

		AcceptOrder: async function (req, res) {
			console.log("AcceptOrder ");
			//Get the orderId and the connected user
			var OrderID = req.body.OrderID;
			username=req.params.user
			var org_name=req.params.mspid

			try {

				let ccp = await helper.getCCP(org_name)
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				//Change the order status over the blockchain 
				//The change AcceptOrder function changer the ownership of the order
				result = await contract.submitTransaction('AcceptOrder', OrderID);
				console.log('Transaction has been submitted');
				var obj = JSON.parse(result);
				//Change the ownership of the order on the database
				orderObject.findByIdAndUpdate({ _id:OrderID}, {$inc:{ Emplacement: 1}}, function(err, result){

					if(err){
						res.json({'success':false}); 
					}
					
				})
				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(obj)
				return (obj)

			} catch (error) {
				console.error(`Failed to submit transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));
			}
		},

		GetOrder: async function (req, res) {
			console.log("GetOrder: ");
			//Get the orderId of the order to read from the blockchain
			var array = req.params.id.split("-");
			var OrderID = array[0];
			username=req.params.user
			var org_name=req.params.mspid
			try {

				let ccp = await helper.getCCP(org_name)
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				const result = await contract.evaluateTransaction('GetOrder',OrderID);
				console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
				var obj = JSON.parse(result);

				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(obj)
				return (obj)
			} catch (error) {
				console.error(`Failed to evaluate transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));
			}
		},
		
		//Get list of order from the database for listing
		GetOrders: async function (req, res) {
			//declare return object
				try {
					orderObject.find((error,results)=>{
					if(error){
						res.json({"success":false});
					}else{
						if(results==null){
							res.json({"success":false});
						}else{
							res.json({"success":true,'data':results});
				
						}
					}
					});
				}
				catch(err) {
					//print and return error
					console.log(err);
					var error = {};
					error.error = err.message;
					return res.json(error);
				}
				},
		//Get Product by Id frol the database
		GetProduct: async function (req, res) {
			console.log("GetProduct: ");
			var array = req.params.id.split("-");
			var ProductID = array[0];
			username=req.params.user
			var org_name=req.params.mspid
			try {

				let ccp = await helper.getCCP(org_name)
				// Create a new file system based wallet for managing identities.
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				// Check to see if we've already enrolled the user.
				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the network (channel) our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				const result = await contract.evaluateTransaction('GetProduct',ProductID);
				console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
				var obj = JSON.parse(result);

				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(obj)
				return (obj)
			} catch (error) {
				console.error(`Failed to evaluate transaction: ${error}`);
				res.status(500).send(new Error('You are not authorized to do this operation'));

				//process.exit(1);
			}
		},


  
		//Get list of products for listing
		GetProducts: async function (req, res) {
		//declare return object
			try {
				productObject.find((error,results)=>{
				if(error){
					res.json({"success":false});
				}else{
					if(results==null){
						res.json({"success":false});
					}else{
						res.json({"success":true,'data':results});
			
					}
				}
				});
			}
			catch(err) {
				var error = {};
				error.error = err.message;
				return res.json(error);
			}
			},
		//Get Order Hisorty from the supplychain
		getHistoryOfOrder: async function (req, res) {
			console.log("getHistoryOfOrder: ");
			var array = req.params.id.split("-");
			var OrderID = array[0];
			username=req.params.user
			var org_name=req.params.mspid
			try {
				let ccp = await helper.getCCP(org_name)
				const walletPath = await helper.getWalletPath(org_name)
				const wallet = await Wallets.newFileSystemWallet(walletPath);
				console.log(`Wallet path: ${walletPath}`);

				let identity = await wallet.get(username);
				if (!identity) {
					console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
					await helper.getRegisteredUser(username, org_name, true)
					identity = await wallet.get(username);
					console.log('Run the registerUser.js application before retrying');
					return;
				}	

				const connectOptions = {
					wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
					eventHandlerOptions: {
						commitTimeout: 100,
						strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
					},
				}
				// Create a new gateway for connecting to our peer node.
				const gateway = new Gateway();
				await gateway.connect(ccp, connectOptions);

				// Get the channel our contract is deployed to.
				const network = await gateway.getNetwork('mychannel');

				// Get the contract from the network.
				const contract = network.getContract('fabcar');
				const result = await contract.evaluateTransaction('getHistoryOfOrders',OrderID);
				console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
				var obj = JSON.parse(result);

				// Disconnect from the gateway.
				await gateway.disconnect();
				res.send(obj)
				return (obj)
			} catch (error) {
				console.error(`Failed to evaluate transaction: ${error}`);
			}
		},

	}
})();