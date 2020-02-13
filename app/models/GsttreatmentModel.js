const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
});

module.exports = mongoose.model("gsttreatment", Schema);
