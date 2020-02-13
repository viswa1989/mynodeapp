const mongoose = require("mongoose");

const divisionaccountsSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  invoice: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  grn: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  purchase: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  purchase_return: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  credit_note: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  debit_note: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  order: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  inward: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  outward: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  contract_inward: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  contract_outward: {
    prefix: {type: String, trim: true, required: true},
    serial_no: {type: Number, required: true},
  },
  return: {
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

module.exports = mongoose.model("divisionaccounts", divisionaccountsSchema);
