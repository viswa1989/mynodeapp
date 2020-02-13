const mongoose = require("mongoose");

function Checkpaymentexist(value, res) {
    if (value) {
      const val = this.invoice_id;
      const id = this._id;
      mongoose.models.paymentledger.count({_id: {$ne: id}, invoice_id: val, status: "Open"}, (err, count) => {
        if (err) {
          return res(err);
        }
        res(!count);
      });
    }
}

const paymentledgerSchema = new mongoose.Schema({
  invoice_id: {type: mongoose.Schema.Types.ObjectId, ref: "bill", required: true,validate: [{isAsync: true, validator: Checkpaymentexist, msg: "Payment already in queue for this invoice. You have to wait untill it confirm."}]},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, required: true, trim: true},
  payment_mode: {type: String, required: true, trim: true},
  amount: {type: Number, required: true},
  status: {type: String, required: true, trim: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now },
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("paymentledger", paymentledgerSchema);
