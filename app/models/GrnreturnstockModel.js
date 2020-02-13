const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);

function isretGrnUnique(value, res) {
  if (value) {
    mongoose.models.grnreturnstock.count({_id: {$ne: this._id}, division_id: this.division_id, return_no: this.return_no}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function isgrnUnique(value, res) {
  if (value) {
    mongoose.models.grnreturnstock.count({_id: {$ne: this._id}, division_id: this.division_id, grn_id: this.grn_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function ispoUnique(value, res) {
  if (value) {
    mongoose.models.grnreturnstock.count({_id: {$ne: this._id}, division_id: this.division_id, po_id: this.po_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const grnreturnstocksSchema = new mongoose.Schema({
  return_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isretGrnUnique, msg: "Return No already exists"},
    ]},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  grn_id: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isgrnUnique, msg: "GRN No already exists"},
    ]},
  grn_no: {type: String, trim: true, required: true},
  po_no: {type: String, trim: true, required: true},
  po_id: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: ispoUnique, msg: "Return entry for this GRN already entered"},
    ]},
  invoice_no: {type: String, trim: true, required: true},
  grn_date: {type: Date, required: true},
  return_date: {type: Date, required: true},
  total_amt: {type: Double, required: true},
  return_amt: {type: Double, required: true},
  vendor_name: {type: String, trim: true, required: true},
  vendor_id: {type: mongoose.Schema.Types.ObjectId, ref: "vendor", required: true},
  stock_details: [{
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
    product_name: {type: String, trim: true, required: true},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
    quantity: {type: Float, required: true},
    landing_cost: {type: Double, required: true},
    total: {type: Double, required: true},
    return_quantity: {type: Float, required: true},
    return_total: {type: Double, required: true},
    reason: {type: String, trim: true, required: true},
  }],
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("grnreturnstock", grnreturnstocksSchema);
