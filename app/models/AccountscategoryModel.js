const mongoose = require("mongoose");

const accountcategorysSchema = new mongoose.Schema({
  DemographicId: {type: String, required: true},
  DEFAULT: {type: String},
  ParentId: {type: String},
  category_name: {type: String, trim: true, required: true},
  category_unique: {type: String},
  category_id: {type: String},
  groupname: {type: String},
  groupIndex: {type: String},
  groupunique: {type: String},
  level: {type: String, required: true},
  uid: {type: String},
  parent_uid: {type: String},
  nodeDisabled: {type: String},
  categoryType: {type: String, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("accountcategorys", accountcategorysSchema);
