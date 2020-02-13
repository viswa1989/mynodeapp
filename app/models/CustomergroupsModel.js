const mongoose = require("mongoose");
const Double = require("mongoose-float").loadType(mongoose, 2);

function isGroupUnique(value, res) {
  if (value) {
    const regex = new RegExp(this.name, "i");
    mongoose.models.customergroup.count({_id: {$ne: this._id}, name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isGroupUnique, msg: "Customer group already exist."},
    ]},
  default: {type: Boolean, default: false},
  group_discount: [{
    division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division"},
    process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process"},
    measurement_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_measure"},
    discount_price: {type: Double},
  }],
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("customergroup", Schema);
