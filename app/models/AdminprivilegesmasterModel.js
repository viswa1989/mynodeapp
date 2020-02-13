const mongoose = require("mongoose");

const Schemas = new mongoose.Schema({
  privilege_id: {type: Number, required: true},
  page: {type: String, trim: true, required: true},
  pid: {type: Number, required: true},
  Read: {type: Boolean, default: false},
  Modify: {type: Boolean, default: false},
  Remove: {type: Boolean, default: false},
});

module.exports = mongoose.model("adminprivilegesmaster", Schemas);

