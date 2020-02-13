const mongoose = require("mongoose");
const Double = require("mongoose-float").loadType(mongoose, 2);
const Float = require("mongoose-float").loadType(mongoose, 3);

function isgrnUnique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      mongoose.models[modelName].count({_id: {$ne: this._id}, division_id: this.division_id, grn_no: value}, (err, count) => {
        if (err) {
          respond(false);
        }
        // If `count` is greater than zero, "invalidate"
        respond(!count);
      });
    } else { respond(false); }
  };
}

function ispoUnique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      mongoose.models[modelName].count({_id: {$ne: this._id}, division_id: this.division_id, po_no: value}, (err, count) => {
        if (err) {
          respond(false);
        }
        // If `count` is greater than zero, "invalidate"
        respond(!count);
      });
    } else { respond(false); }
  };
}

const grnstockSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  grn_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isgrnUnique("grnstock", "grn_no", true), msg: "GRN No already exists"},
    ]},
  po_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: ispoUnique("grnstock", "po_no", true), msg: "GRN for this Purchase order already received"},
    ]},
  po_id: {type: mongoose.Schema.Types.ObjectId, ref: "purchaseorder", required: true},
  invoice_no: {type: String, trim: true, required: true},
  grn_date: {type: Date, required: true},
  total_amt: {type: Double, required: true},
  vendor_name: {type: String, trim: true, required: true},
  vendor_id: {type: mongoose.Schema.Types.ObjectId, ref: "vendor", required: true},
  stock_details: [{
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
    product_name: {type: String, trim: true, required: true},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
    quantity: {type: Float, required: true},
    landing_cost: {type: Double, required: true},
    total: {type: Double, required: true},
    //            reason: {type: String, trim: true, required: true}
  }],
  is_return: {type: Boolean, default: false, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("grnstock", grnstockSchema);
