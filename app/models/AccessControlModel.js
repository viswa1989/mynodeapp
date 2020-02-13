const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  role: String,
  action: String,
  permission: Number,
});

module.exports = mongoose.model("accesscontrols", Schema);// should be plural
