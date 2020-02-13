const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
  gstCode: {type: String, trim: true, required: true},
});

module.exports = mongoose.model("statelist", Schema);
