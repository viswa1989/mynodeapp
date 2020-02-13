const mongoose = require("mongoose");

function isColorUnique(value, res) {
  if (value) {
    const regex = new RegExp(`^${this.fabric_color}$`, "i");
    const id = this._id;
    mongoose.models.fabric_color.count({_id: {$ne: id}, fabric_color: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

function isColorcodeUnique(value, res) {
  if (value) {
    const id = this._id;
    const regex = new RegExp(`^${this.fabric_color_code}$`, "i");
    mongoose.models.fabric_color.count({_id: {$ne: id}, fabric_color_code: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const manageScheme = new mongoose.Schema({
  fabric_color: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isColorUnique, msg: "Color already exists"},
    ]},
  color: {type: String, trim: true},
  fabric_color_code: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isColorcodeUnique, msg: "Color code already exists"},
    ]},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

manageScheme.pre("save", function (next) {
  // capitalize
  this.fabric_color.charAt(0).toUpperCase() + this.fabric_color.slice(1);

  next();
});

module.exports = mongoose.model("fabric_color", manageScheme);
