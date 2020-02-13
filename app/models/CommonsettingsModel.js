const mongoose = require("mongoose");

const commonsettingsSchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
  strvalue: {type: String, trim: true},
  numvalue: {type: Number},
  level: {type: Number, required: true},
  type: {type: String, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
});

module.exports = mongoose.model("commonsetting", commonsettingsSchema);
