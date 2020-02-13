const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);

const grnstockdetailsSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "branch", required: true},
  grn_id: {type: mongoose.Schema.Types.ObjectId, ref: "grnstock", required: true},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  subcategory_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  brand_id: {type: mongoose.Schema.Types.ObjectId, ref: "brands", required: true},
  item_id: {type: mongoose.Schema.Types.ObjectId, ref: "items", required: true},
  quantity: {type: Float, required: true},
  mrp: {type: Double, required: true},
  landing_cost: {type: Double, required: true},
  selling_cost: {type: Double, required: true},
}, {strict: true});

module.exports = mongoose.model("grnstockdetail", grnstockdetailsSchema);
