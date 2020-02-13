const mongoose = require("mongoose");

const ValidationError = mongoose.Error.ValidationError;

function isunique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      let query = mongoose.model(modelName).where(field, new RegExp(`^${value}$`, caseSensitive ? "i" : ""));
      query = query.where("_id").ne(this._id);

      query.count((err, n) => {
        respond(n < 1);
      });
    } else {
      respond(false);
    }
  };
}

const billSchema = new mongoose.Schema({
  ledger_id: {type: mongoose.Schema.Types.ObjectId, ref: "accountledger", required: true},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  invoice_date: {type: Date, required: true},
  invoicedue_date: {type: Date, required: true},
  invoice_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isunique("bill", "invoice_no", true), msg: "Invoice No already exists"}]},
  serial_no: {type: Number, required: true},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, trim: true, required: true},
  customer_mobile_no: {type: Number, required: true},
  gstin: {type: String, trim: true},
  gstTreatment: {type: mongoose.Schema.Types.ObjectId, ref: "gsttreatment", required: true},
  placeofSupply: {type: mongoose.Schema.Types.ObjectId, ref: "statelist"},
  customer_notes: {type: String, trim: true},
  billing_address: {
    billing_company_name: {type: String, trim: true},
    billing_address_line: {type: String, trim: true},
    billing_area: {type: String, trim: true},
    billing_city: {type: String, trim: true},
    billing_pincode: {type: Number},
    billing_contact_no: {type: Number},
    billing_landmark: {type: String, trim: true},
    billing_state: {type: String, trim: true},
    billing_gstin: {type: String, trim: true},
  },
  default_address: {
    billing_company_name: {type: String, trim: true},
    billing_address_line: {type: String, trim: true},
    billing_area: {type: String, trim: true},
    billing_city: {type: String, trim: true},
    billing_pincode: {type: Number},
    billing_contact_no: {type: Number},
    billing_landmark: {type: String, trim: true},
    billing_state: {type: String, trim: true},
    billing_gstin: {type: String, trim: true},
  },
  type: {type: String, trim: true, required: true},
  payment_status: {type: String, trim: true, required: true},
  bill_type: {type: String, trim: true, required: true},
  items: [{
    _id: {type: mongoose.Schema.Types.ObjectId, ref: "delivery", required: true},
    division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
    delivery_date: {type: Date, required: true},
    delivery_no: {type: String, trim: true, required: true},
    order_id: {type: mongoose.Schema.Types.ObjectId, ref: "order", required: true},
    order_no: {type: String, trim: true, required: true},
    order_date: {type: Date, required: true},
    order_reference_no: {type: String, trim: true},
    inward_id: {type: mongoose.Schema.Types.ObjectId, ref: "inward", required: true},
    inward_data_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    inward_no: {type: String, trim: true, required: true},
    inward_date: {type: Date, required: true},
    contactperson: {name: {type: String}, mobile_no: {type: Number}},
    followupPerson: {
      name: {type: String, trim: true},
      mobile_no: {type: Number},
      user_id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    },
    customer_dc_no: {type: String, trim: true, required: true},
    customer_dc_date: {type: Date, required: true},
    dyeing: {dyeing_name: {type: String}, _id: {type: mongoose.Schema.Types.ObjectId}},
    dyeing_dc_no: {type: String, trim: true, required: true},
    dyeing_dc_date: {type: Date},
    fabric_color: {type: String, trim: true, required: true},
    fabric_color_id: {type: mongoose.Schema.Types.ObjectId},
    fabric_type: {type: String, trim: true, required: true},
    fabric_id: {type: mongoose.Schema.Types.ObjectId},
    fabric_condition: {type: String, trim: true, required: true},
    measurement: {fabric_measure: {type: String}, _id: {type: mongoose.Schema.Types.ObjectId}},
    dia: {type: Number, required: true},
    lot_no: {type: String, trim: true, required: true},
    rolls: {type: Number, required: true},
    weight: {type: Number, required: true},
    delivery_roll: {type: Number, required: true},
    delivery_weight: {type: Number, required: true},
    inward_weight: {type: Number, required: true},
    received_weight: {type: Number},
    delivery_status: {type: String, trim: true, required: true},
    process: [{
      baseprice: {type: Number},
      discountprice: {type: Number},
      price: {type: Number, required: true},
      process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process", required: true},
      process_name: {type: String, trim: true, required: true},
      specialprice: {type: Number, required: true},
      subtotal: {type: Number, required: true},
      total: {type: Number, required: true},
      totaltax: {type: Number, required: true},
      invoice_option: {type: String, enum: ["Received Weight", "Delivery Weight"], required: true},
      tax_class: [{
        tax_name: {type: String, trim: true},
        tax_percentage: {type: Number, required: true},
        taxamount: {type: Number, required: true},
        _id: {type: mongoose.Schema.Types.ObjectId, required: true},
      }],
    }],
  }],
  otheritems: [{
    itemname: {type: String, trim: true, required: true},
    pretotal: {type: Number, required: true},
    price: {type: Number, required: true},
    qty: {type: Number, required: true},
    subtotal: {type: Number, required: true},
    total: {type: Number, required: true},
    hsn_code: {type: String, trim: true},
    tax_class: [{
      display_name: {type: String, trim: true},
      tax_name: {type: String, trim: true},
      tax_id: {type: mongoose.Schema.Types.ObjectId, ref: "taxes"},
      tax_percentage: {type: Number},
      taxamount: {type: Number},
    }],
  }],
  email_status: {type: Boolean, default: false},
  tax_data: [{tax_name: {type: String, trim: true},
    tax_percentage: {type: Number},
    taxamount: {type: Number},
    _id: {type: mongoose.Schema.Types.ObjectId, ref: "taxes"},
  }],
  subtotal: {type: Number},
  total: {type: Number},
  roundoff: {type: String, trim: true},
  paid: {type: Number},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  superadmin_flag: {type: Boolean, default: false},
  superadmin_flag_added_by: {type: String, trim: true},
  superadmin_flag_user: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  divisionadmin_flag: {type: Boolean, default: false},
  divisionadmin_flag_added_by: {type: String, trim: true},
  divisionadmin_flag_user: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
});

billSchema.pre("save", function (next) {
  if (this.paid) {
    if (this.paid === 0) {
      this.payment_status = "PENDING";
    } else {
      //            if (parseFloat(this.paid) > parseFloat(this.total)) {
      //                var error = new ValidationError(this);
      //
      //                error.errors.serial_no = {};
      //                error.errors.serial_no.path = "paid";
      //                error.errors.serial_no.name = "ValidatorError";
      //                error.errors.serial_no.message = "Allocate bill amount must be less than the bill total amount";
      //                error.errors.serial_no.value = "";
      //
      //                return next(error);
      //            }
      if (this.paid >= this.total) {
        this.payment_status = "COMPLETED";
      } else {
        this.payment_status = "PARTIAL";
      }
    }
  }
  next();
});

module.exports = mongoose.model("bill", billSchema);
