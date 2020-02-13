const mongoose = require("mongoose");

const customerbalanceSchema = new mongoose.Schema({
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  name: {type: String, trim: true, required: true},
  total_balance: {type: Number, required: true},
  total_allocated: {type: Number, required: true},
  pending_balance: {type: Number, required: true},
  due_status: {type: String, enum: ["Open", "Closed"], default: "Open", required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

customerbalanceSchema.pre("save", function (next) {
  const self = this;
  
  if (this.pending_balance !== null && parseFloat(this.pending_balance) == 0) {
    self.due_status = "Closed";
    next();
  } else {
    self.due_status = "Open";
    next();
  }
});

module.exports = mongoose.model("customeropeningbalances", customerbalanceSchema);
