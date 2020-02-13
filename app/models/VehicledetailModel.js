const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  vehicle_no: {type: String, trim: true, required: true},
  created: {type: Date, default: Date.now},
}, {strict: true});

module.exports = mongoose.model("vehicledetail", Schema);
