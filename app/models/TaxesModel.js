const mongoose = require("mongoose");
const Double = require("mongoose-float").loadType(mongoose, 2);

const itemSchema = new mongoose.Schema({
  tax_name: {type: String, trim: true, required: true},
  tax_percentage: {type: Double, required: true},
  tax_description: {type: String, trim: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("taxes", itemSchema);
