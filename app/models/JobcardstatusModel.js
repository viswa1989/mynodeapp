const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  color: {type: String, trim: true},
  name: {type: String, trim: true, required: true},
  priority: {type: Number},
});

module.exports = mongoose.model("jobcardstatus", Schema);
