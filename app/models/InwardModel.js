const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);
const async = require("async");

function isUnique(value, res) {
  if (value) {
    mongoose.models.inward.count({_id: {$ne: this._id}, inward_no: this.inward_no, division_id: this.division_id}, (err, count) => {
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
  order_reference_no: {type: String, trim: true, required: true},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, trim: true, required: true},
  customer_mobile_no: {type: Number, required: true},
  inward_data: [{
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
    delivery_status: {type: String, enum: ["Pending", "Partial", "Completed"], default: "Pending"},
    delivered_weight: {type: Float},
    returned_weight: {type: Float},
  }],
  total_weight: {type: Float},
  total_delivered_weight: {type: Float},
  total_returned_weight: {type: Float},
  inward_status: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

Schema.path("inward_data").validate((value, respond) => {
  if (value !== null && value !== "" && value.length > 0) {
    respond(true);
  } else {
    respond(false, "Inward details not found");
  }
}, "Inward details not found");

Schema.pre("save", function (next) {
  const self = this;
  if (this.inward_data && this.inward_data !== null && this.inward_data.length > 0) {
    let total_weight = 0,
      total_delivered_weight = 0,
      total_returned_weight = 0,
      i = 0,
      completed = 0;

    async.each(this.inward_data, (model, cb) => {
      total_weight = (model.weight && parseFloat(model.weight) > 0) ? (total_weight + parseFloat(model.weight)) : total_weight;

      total_delivered_weight = (model.delivered_weight && parseFloat(model.delivered_weight) > 0) ? (total_delivered_weight + parseFloat(model.delivered_weight)) : total_delivered_weight;

      total_returned_weight = (model.returned_weight && parseFloat(model.returned_weight) > 0) ? (total_returned_weight + parseFloat(model.returned_weight)) : total_returned_weight;

      if ((total_delivered_weight + total_returned_weight) >= total_weight) {
        self.inward_data[i].delivery_status = "Completed";
        completed++;
      }
      i++;
      cb();
    }, (err) => {
      self.total_weight = total_weight;
      self.total_delivered_weight = total_delivered_weight;
      self.total_returned_weight = total_returned_weight;
      if (self.inward_data.length - 1 === completed) {
        self.inward_status = "Completed";
      }
      total_weight = null, total_delivered_weight = null, total_returned_weight = null, i = null, completed = null;
      next();
    });
  } else {
    next();
  }
});

Schema.pre("save", function (next, done) {
  const self = this;
  if (this.inward_data && this.inward_data !== null && this.inward_data.length > 0) {
    async.each(this.inward_data, (model, cb) => {
      let total_weight = 0;
      if (model.delivered_weight && model.delivered_weight !== null && parseFloat(model.delivered_weight) > 0) {
        total_weight += parseFloat(model.delivered_weight);
        if ((parseFloat(model.delivered_weight) + 10) > parseFloat(model.weight)) {
          cb("Weight exceeds than received weight", null);
        }
      }
      if (model.returned_weight && model.returned_weight !== null && parseFloat(model.returned_weight) > 0) {
        total_weight += parseFloat(model.returned_weight);
        if (parseFloat(model.returned_weight) > parseFloat(model.weight)) {
          cb("Weight exceeds than received weight", null);
        }
      }
      if ((total_weight + 10) > parseFloat(model.weight)) {
        cb("Weight exceeds than received weight", null);
      } else {
        cb(null, null);
      }
    }, (err, result) => {
      if (err) {
        next("Weight exceeds than received weight");
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("inward", Schema);
