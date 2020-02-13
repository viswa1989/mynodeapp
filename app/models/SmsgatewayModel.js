const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  url: {type: String, required: true, trim: true},
  username: {type: String, required: true, trim: true},
  password: {type: String, trim: true, required: true},
  senderid: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("smsgateways", Schema);
