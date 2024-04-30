var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//local product schema allowing to save Order non critical data off-chain to reduce transction to blockchain when listing 
//the application will use blockchain to search, create product and create order containing the product 
var productSchema = new Schema({
  
  _id: {type: mongoose.Schema.Types.ObjectId,auto: true}, 
  Label :{type : String},
  ManufacturingDate :{type : Date},
  ExpirationDate :{type : Date},
  Manufacturer :{type : String}
 
 
}, { collection: 'product' });

module.exports = mongoose.model('product', productSchema);
