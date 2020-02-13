const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  message: {type: String, trim: true, required: true},
  name: {type: String, trim: true, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  role: {type: Number},
  division: {type: mongoose.Schema.Types.ObjectId, ref: "division"},
  division_name: {type: String, trim: true},
  MENU: {type: String, trim: true, required: true},
  PAGE: {type: String, trim: true, required: true},
  PURPOSE: {type: String, trim: true, required: true},
  linkid: {type: String},
  data: {type: mongoose.Schema.Types.Mixed},
  olddata: {type: mongoose.Schema.Types.Mixed},
  created: {type: Date, default: Date.now},
  notificationReader: [{
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  }],
});

module.exports = mongoose.model("Activity", Schema);
