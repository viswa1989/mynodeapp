const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId},
  name: {type: String, trim: true},
  role: {type: Number},
  username: {type: String, trim: true},
  userrole: {type: String, trim: true},
  uagent: {type: String, trim: true},
  ipaddress: {type: String, trim: true},
  action: {type: String, trim: true},
  created: {type: Date, default: Date.now},
});

module.exports = mongoose.model("usertrack", Schema);
