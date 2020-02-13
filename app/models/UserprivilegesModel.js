const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  privilege_master_id: {type: mongoose.Schema.Types.ObjectId, ref: "adminprivilegesmaster", required: true},
  privilege_id: {type: Number, required: true},
  Read: {type: Boolean, default: false},
  Modify: {type: Boolean, default: false},
  Remove: {type: Boolean, default: false},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
});

module.exports = mongoose.model("userprivileges", Schema);
