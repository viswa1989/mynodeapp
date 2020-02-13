const mongoose = require("mongoose");

function isUnique(value, res) {
  if (value) {
    mongoose.models.specialprice.count({_id: {$ne: this._id}, order_id: this.order_id, process_id: this.process_id, measurement_id: this.measurement_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  order_id: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUnique, msg: "Special Price for this units is already exists."},
    ]},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process"},
  measurement_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_measure", required: true},
  qty: {type: Number},
  price: {type: Number},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("specialprice", Schema);
