const mongoose = require("mongoose");

function isTypeUnique(value, res) {
  if (value) {
    const regex = new RegExp(`^${this.fabric_type}$`, "i");
    const id = this._id;
    mongoose.models.fabric_type.count({_id: {$ne: id}, fabric_type: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const manageScheme = new mongoose.Schema({
  fabric_type: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isTypeUnique, msg: "Fabric type already exists"},
    ]},
  color: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("fabric_type", manageScheme);
