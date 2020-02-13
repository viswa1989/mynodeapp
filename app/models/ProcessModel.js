const mongoose = require("mongoose");

function isProcessUnique(value, res) {
  if (value) {
    const id = this._id;
    const regex = new RegExp(`^${this.process_name}$`, "i");
    const divisionid = this.division_id;
    mongoose.models.process.count({_id: {$ne: id}, division_id: divisionid, process_name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

function isProcesscodeUnique(value, res) {
  if (value) {
    if (this.process_code && this.process_code !== null && this.process_code !== "") {
      const regex = new RegExp(`^${this.process_code}$`, "i");
      const id = this._id;
      const divisionid = this.division_id;
      mongoose.models.process.count({_id: {$ne: id}, division_id: divisionid, process_code: regex}, (err, count) => {
        if (err) {
          return res(err);
        }
        res(!count);
      });
    } else {
      res(true);
    }
  } else {
    res(true);
  }
}

const Schema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  process_name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isProcessUnique, msg: "Process name already exists"},
    ]},
  process_code: {type: String,
    trim: true,
    validate: [
      {isAsync: true, validator: isProcesscodeUnique, msg: "Process code already exists"},
    ]},
  hsn_code: {type: String, trim: true, required: true},
  color: {type: String, trim: true},
  measurement: [{
    measurement_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_measure", required: true},
    qty: {type: Number, trim: true},
    cost: {type: Number, trim: true},
  }],
  tax_class: [{type: mongoose.Schema.Types.ObjectId, ref: "taxes", required: true}],
  inter_tax_class: [{type: mongoose.Schema.Types.ObjectId, ref: "taxes", required: true}],
  process_picture: {type: String},
  invoice_option: {type: String, enum: ["Received Weight", "Delivery Weight"], required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

Schema.path("tax_class").validate((value) => {
  return value.length;
}, "Please select tax details for this process");

module.exports = mongoose.model("process", Schema);
