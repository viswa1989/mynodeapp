const mongoose = require("mongoose");
const Double = require("mongoose-float").loadType(mongoose, 2);
const Float = require("mongoose-float").loadType(mongoose, 3);

const purchaseorderdetailSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "branch", required: true},
  purchase_id: {type: mongoose.Schema.Types.ObjectId, ref: "purchaseorder", required: true},
  item_id: {type: mongoose.Schema.Types.ObjectId, ref: "items", required: true},
  quantity: {type: Float, required: true},
  price: {type: Double, required: true},
  total: {type: Double, required: true},
  received_quantity: {type: Float},
  received_price: {type: Double},
}, {strict: true});

module.exports = mongoose.model("purchaseorderdetailSchema", purchaseorderdetailSchema);
