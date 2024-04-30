//SPDX-License-Identifier: Apache-2.0



// call the packages we need
const log4js = require('log4js');

var express = require('express');     
var app = express();               
var bodyParser = require('body-parser');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.use(bodyParser.json());
app.use(methodOverride('_method'));

require('./routes.js')(app);

var port = process.env.PORT || 3000;

// Start the server and listen on port 
app.listen(port, function () {
  console.log("Server is running on port: " + port);
});