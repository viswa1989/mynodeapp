const mongoose = require("mongoose");

function isMeasureUnique(value, res) {
  if (value) {
    const regex = new RegExp(`^${this.fabric_measure}$`, "i");
    const id = this._id;
    mongoose.models.fabric_measure.count({_id: {$ne: id}, fabric_measure: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const manageScheme = new mongoose.Schema({
  fabric_measure: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isMeasureUnique, msg: "Measurement unit already exist."},
    ]},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("fabric_measure", manageScheme);
