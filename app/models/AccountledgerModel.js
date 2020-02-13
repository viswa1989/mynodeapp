const mongoose = require("mongoose");
const Double = require("mongoose-float").loadType(mongoose, 2);

const accountledgerSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  type: {type: String, required: true, trim: true},
  name: {type: String, required: true, trim: true},
  default: {type: Boolean, default: false, required: true},
  opening_balance: {type: Double, required: true},
  minimum_balance: {type: Double},
  financial_institution: {type: String, trim: true},
  account_no: {type: String, trim: true},
  notes: {type: String, trim: true},
  abbrevation: {type: String, trim: true},
  favourite: {type: Boolean, default: false},
  closed: {type: Boolean, default: false},
  curreny: {type: String, trim: true},
  interest_rate: {type: Double},
  current_balance: {type: Double, required: true},
  opening_date: {type: Date},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now },
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("accountledger", accountledgerSchema);
