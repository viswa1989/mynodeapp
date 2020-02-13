const mongoose = require("mongoose");

function isPreferenceUnique(value, res) {
  if (value) {
    mongoose.models.preferences.count({_id: {$ne: this._id}, module: this.module, preference: this.preference}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  module: {type: String, required: true, trim: true},
  preference: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isPreferenceUnique, msg: " already exists"},
    ]},
  value: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("preferences", Schema);
