const mongoose = require("mongoose");

const branchaccountsSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "branch", required: true},
  grn: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  grn_return: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  invoice: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  purchase: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  sales: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  jobcard: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("branchaccounts", branchaccountsSchema);
