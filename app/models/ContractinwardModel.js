const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);
const async = require("async");

function isUnique(value, res) {
  if (value) {
    mongoose.models.delivery.count({_id: {$ne: this._id}, inward_no: this.inward_no, division_id: this.division_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  inward_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUnique, msg: "Inward no already exists"},
    ]},
  inward_serial_no: {type: Number, required: true},
  inward_date: {type: Date, default: Date.now},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  outward_id: {type: mongoose.Schema.Types.ObjectId, ref: "outward"},
  outward_no: {type: String, trim: true, required: true},
  outward_date: {type: Date, required: true},
  order_id: {type: mongoose.Schema.Types.ObjectId, ref: "order"},
  order_no: {type: String, trim: true, required: true},
  order_reference_no: {type: String, trim: true, required: true},
  order_date: {type: Date, required: true},
  customer_dc_no: {type: String, trim: true, required: true},
  customer_dc_date: {type: Date, required: true},
  contract_delivery_no: {type: String, trim: true},
  contract_dc_date: {type: Date},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, trim: true, required: true},
  customer_mobile_no: {type: Number, required: true},
  inward_data: [{
    outward_data_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    inward_id: {type: mongoose.Schema.Types.ObjectId, ref: "inward", required: true},
    inward_data_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    inward_no: {type: String, trim: true, required: true},
    inward_date: {type: Date, required: true},
    fabric_condition: {type: String, enum: ["Dry", "Wet"], required: true},
    process: [{process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process"},
      process_name: {type: String, trim: true}}],
    fabric_type: {type: String, trim: true, required: true},
    fabric_color: {type: String, trim: true, required: true},
    dia: {type: Double, required: true},
    rolls: {type: Number, required: true},
    weight: {type: Float, required: true},
    lot_no: {type: String, trim: true},
    received_roll: {type: Number, required: true},
    received_weight: {type: Number, required: true},
    inward_status: {type: String, enum: ["Pending", "Completed"], default: "Pending"},
  }],
  total_weight: {type: Float},
  total_returned_weight: {type: Float},
  contractor_id: {type: mongoose.Schema.Types.ObjectId, ref: "contractor", required: true},
  contractor_name: {type: String, trim: true, required: true},
  contractor_mobile_no: {type: Number, required: true},
  contractor_address1: {type: String, trim: true, required: true},
  contractor_address2: {type: String, trim: true},
  contractor_pincode: {type: String},
  gstin_number: {type: String, trim: true},
  vehicle_no: {type: String, trim: true, required: true},
  driver_name: {type: String, trim: true, required: true},
  driver_no: {type: Number},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

Schema.path("inward_data").validate((value, respond) => {
  if (value !== null && value !== "" && value.length > 0) {
    respond(true);
  } else {
    respond(false, "Inward details not found");
  }
}, "Inward details not found");

Schema.pre("save", function (next) {
  const self = this;
  if (this.outward_data && this.outward_data !== null && this.outward_data.length > 0) {
    let total_weight = 0,
      total_returned_weight = 0,
      i = 0;

    async.each(this.outward_data, (model, cb) => {
      if (model.weight && parseFloat(model.weight) > 0) {
        total_weight += parseFloat(model.weight);
      }
      if (model.received_weight && parseFloat(model.received_weight) > 0) {
        total_returned_weight += parseFloat(model.received_weight);
      }
      cb();
    }, (err) => {
      if (err) { next(); }
      self.total_weight = total_weight;
      self.total_returned_weight = total_returned_weight;
      next();
    });
  } else {
    next();
  }
}); 

module.exports = mongoose.model("contractinward", Schema);
