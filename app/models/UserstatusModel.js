const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId},
  user_id: {type: mongoose.Schema.Types.ObjectId},
  role: {type: Number},
  socketId: {type: String, trim: true},
  division_id: {type: mongoose.Schema.Types.ObjectId},
  online: {type: String, trim: true},
  created: {type: Date, default: Date.now},
});

module.exports = mongoose.model("userstatus", Schema);
