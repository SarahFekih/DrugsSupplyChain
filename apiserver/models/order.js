var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//local order schema allowing to save Order non critical data off-chain to reduce transction to blockchain when listing 
//the application will user blockchain to search, change the order status  and the order
var orderSchema = new Schema({
  
  _id: {type: mongoose.Schema.Types.ObjectId,auto: true}, 
  ProductID :{type : String},
  DateOfDelivery :{type : Date}, 
  Emplacement:{type : Number,default:0},
 
}, { collection: 'order' });

module.exports = mongoose.model('order', orderSchema);
