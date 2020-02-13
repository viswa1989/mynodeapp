const mongoose = require("mongoose");

function ispoUnique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      mongoose.models[modelName].count({_id: {$ne: this._id}, division_id: this.division_id, po_no: value}, (err, count) => {
        if (err) {
          respond(false);
        }
        // If `count` is greater than zero, "invalidate"
        respond(!count);
      });
    } else {
      respond(false);
    }
  };
}

const purchaseorderSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  po_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: ispoUnique("purchaseorder", "po_no", true), msg: "PO No already exists"},
    ]},
  //    reference_no: {type: String},
  vendor: {type: mongoose.Schema.Types.ObjectId, ref: "vendor", required: true},
  order_date: {type: Date, required: true},
  delivery_date: {type: Date, required: true},
  total: {type: Number, required: true},
  status: {type: String, enum: ["WAITING", "DENIED", "CANCELLED", "APPROVED", "DELIVERED"], required: true},
  purchase_details: [{
    product_id: {type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
    product_name: {type: String, trim: true, required: true},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    total: {type: Number, required: true},
    received_quantity: {type: Number},
    received_price: {type: Number},
  }],
  OTP: {type: String, required: true},
  notes: {type: String, trim: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("purchaseorder", purchaseorderSchema);
