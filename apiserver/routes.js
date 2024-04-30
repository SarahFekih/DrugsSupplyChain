//SPDX-License-Identifier: Apache-2.0

var route = require('./controller.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/testDB');
mongoose.connection.on("open", function(ref) {
  console.log("Connected to mongo server.");
 });
 
 mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!" +err);
 });


module.exports = function(app){
  //singin qnd singup
  app.get('/SignInUser/:id', function(req, res){
    route.SignInUser(req, res);
  });
  app.get('/RegisterUser/:user', function(req, res){
    route.RegisterUser(req, res);
  });
//Product management
  app.post('/CreateProduct/:user/:mspid', function(req, res){
    route.CreateProduct(req, res);
  });
  app.get('/GetProduct/:id/:user/:mspid', function(req, res){
    route.GetProduct(req, res);
  });
  app.get('/GetProducts/:user/:mspid', function(req, res){
    route.GetProducts(req, res);
  });
  //Order management
  app.post('/CreateOrder/:user/:mspid', function(req, res){
    route.CreateOrder(req, res);
  });
  app.post('/SendOrder/:user/:mspid', function(req, res){
    route.SendOrder(req, res);
  });
  app.post('/AcceptOrder/:user/:mspid', function(req, res){
    route.AcceptOrder(req, res);
  });
  app.get('/GetOrder/:id/:user/:mspid', function(req, res){
    route.GetOrder(req, res);
  });
  app.get('/GetOrders/:user/:mspid', function(req, res){
    route.GetOrders(req, res);
  });  
  app.get('/getHistoryOfOrder/:id/:user/:mspid', function(req, res){
    route.getHistoryOfOrder(req, res);
  });



}