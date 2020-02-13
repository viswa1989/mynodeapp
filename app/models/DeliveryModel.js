const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);
const async = require("async");

function isUnique(value, res) {
  if (value) {
    mongoose.models.delivery.count({_id: {$ne: this._id}, delivery_no: this.delivery_no, division_id: this.division_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  delivery_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUnique, msg: "Outward no already exists"},
    ]},
  delivery_serial_no: {type: Number, required: true},
  delivery_date: {type: Date, default: Date.now},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  order_id: {type: mongoose.Schema.Types.ObjectId, ref: "order"},
  order_no: {type: String, trim: true, required: true},
  order_date: {type: Date, required: true},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, trim: true, required: true},
  customer_mobile_no: {type: Number, required: true},
  outward_data: [{
    inward_id: {type: mongoose.Schema.Types.ObjectId, ref: "inward", required: true},
    inward_data_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    inward_no: {type: String, trim: true, required: true},
    inward_date: {type: Date, required: true},
    fabric_condition: {type: String, enum: ["Dry", "Wet"], required: true},
    process: [{process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process"},
      process_name: {type: String, trim: true}}],
    measurement: {
      _id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_measure", required: true},
      fabric_measure: {type: String, trim: true, required: true},
    },
    fabric_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_type", required: true},
    fabric_type: {type: String, trim: true, required: true},
    fabric_color_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_color", required: true},
    fabric_color: {type: String, trim: true, required: true},
    dia: {type: Double, required: true},
    rolls: {type: Number, required: true},
    weight: {type: Float, required: true},
    lot_no: {type: String, trim: true},
    delivery_roll: {type: Number, required: true},
    delivery_weight: {type: Number, required: true},
    delivery_status: {type: String, enum: ["Pending", "Completed"], default: "Pending"},
  }],
  order_type: {type: String, enum: ["Normal", "Reprocess"], required: true},
  total_weight: {type: Float},
  total_delivered_weight: {type: Float},
  billing_company_name: {type: String, trim: true},
  billing_gstin: {type: String, trim: true},
  billing_address_line: {type: String, trim: true, required: true},
  billing_area: {type: String, trim: true, required: true},
  billing_city: {type: String, trim: true, required: true},
  billing_pincode: {type: Number, required: true},
  billing_state: {type: String, trim: true, required: true},
  delivery_company_name: {type: String, trim: true, required: true},
  delivery_address_line: {type: String, trim: true},
  delivery_city: {type: String, trim: true},
  delivery_pincode: {type: Number},
  delivery_state: {type: String, trim: true},
  vehicle_no: {type: String, trim: true, required: true},
  driver_name: {type: String, trim: true, required: true},
  driver_no: {type: Number},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
  is_return: {type: Boolean, default: false, required: true},
}, {strict: true});

Schema.path("outward_data").validate((value, respond) => {
  if (value !== null && value !== "" && value.length > 0) {
    respond(true);
  } else {
    respond(false, "Outward details not found");
  }
}, "Outward details not found");

Schema.pre("save", function (next) {
  const self = this;
  if (this.outward_data && this.outward_data !== null && this.outward_data.length > 0) {
    let total_weight = 0,
      total_delivered_weight = 0,
      i = 0;

    async.each(this.outward_data, (model, cb) => {
      if (model.weight && parseFloat(model.weight) > 0) {
        total_weight += parseFloat(model.weight);
      }
      if (model.delivery_weight && parseFloat(model.delivery_weight) > 0) {
        total_delivered_weight += parseFloat(model.delivery_weight);
      }
      cb();
    }, (err) => {
      if (err) { next(); }
      self.total_weight = total_weight;
      self.total_delivered_weight = total_delivered_weight;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("delivery", Schema);
