const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  driver_name: {type: String, trim: true, required: true},
  driver_no: {type: Number},
  created: {type: Date, default: Date.now},
}, {strict: true});

module.exports = mongoose.model("driverdetail", Schema);
