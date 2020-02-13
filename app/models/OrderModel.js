const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);
const Double = require("mongoose-float").loadType(mongoose, 2);

function isUnique(value, res) {
  if (value) {
    mongoose.models.order.count({_id: {$ne: this._id}, order_no: this.order_no, division_id: this.division_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  order_no: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUnique, msg: "Job no already exists"},
    ]},
  order_serial_no: {type: Number, required: true},
  order_date: {type: Date, default: Date.now},
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  customer_id: {type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  customer_name: {type: String, trim: true, required: true},
  customer_mobile_no: {type: Number, required: true},
  billing_address_line: {type: String, trim: true, required: true},
  billing_area: {type: String, trim: true},
  billing_city: {type: String, trim: true, required: true},
  billing_pincode: {type: Number, required: true},
  billing_state: {type: String, trim: true, required: true},
  contactperson: {
    name: {type: String, trim: true, required: true},
    mobile_no: {type: Number, required: true},
    person_id: {type: mongoose.Schema.Types.ObjectId},
  },
  followupPerson: {
    name: {type: String, trim: true},
    mobile_no: {type: Number},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  },
  immediate_job: {type: Boolean, default: false, required: true},
  order_reference_no: {type: String, trim: true, required: true},
  customer_dc_no: {type: String, trim: true, required: true},
  customer_dc_date: {type: Date, required: true},
  dyeing: {
    _id: {type: mongoose.Schema.Types.ObjectId, ref: "dyeingDetails", required: true},
    dyeing_name: {type: String, trim: true, required: true},
  },
  dyeing_dc_no: {type: String, trim: true, required: true},
  dyeing_dc_date: {type: Date},
  order_status: {type: String, trim: true, required: true},
  deilvery_status: {type: String, enum: ["Initial", "Partial", "Completed"], required: true},
  order_type: {type: String, enum: ["Normal", "Reprocess"], required: true},
  billable: {type: Boolean, default: false, required: true},
  received_weight: {type: Float, required: true},
  delivered_weight: {type: Float},
  returned_weight: {type: Float},
  inwards: [{type: mongoose.Schema.Types.ObjectId, ref: "inward"}],
  outward_delivery: [{type: mongoose.Schema.Types.ObjectId, ref: "delivery"}],
  return_delivery: [{type: mongoose.Schema.Types.ObjectId, ref: "delivery"}],
  contract_outward: [{type: mongoose.Schema.Types.ObjectId, ref: "outward"}],
  contract_inward: [{type: mongoose.Schema.Types.ObjectId, ref: "contractinward"}],
  labReport: [{colour: {type: String, trim: true},
    fabric: {type: String, trim: true},
    KDia: {type: String, trim: true},
    BW: {type: String, trim: true},
    AW: {type: String, trim: true},
    L: {type: String, trim: true},
    W: {type: String, trim: true},
    BWGSM: {type: String, trim: true},
    AWGSM: {type: String, trim: true},
    is_deleted: {type: Boolean, default: false}}],
  labReportsummary: [{afwash: {type: String, trim: true},
    compdia: {type: String, trim: true},
    gsmaw: {type: String, trim: true},
    gsmbw: {type: String, trim: true},
    shrinklength: {type: String, trim: true},
    shrinkwidth: {type: String, trim: true},
    is_deleted: {type: Boolean, default: false}}],
  orderPrice: [{process_id: {type: mongoose.Schema.Types.ObjectId, ref: "process"},
    measurement_id: {type: mongoose.Schema.Types.ObjectId, ref: "fabric_measure"},
    qty: {type: Float},
    price: {type: Double}}],
  reprocess_orderid: {type: mongoose.Schema.Types.ObjectId, ref: "order"},
  reprocess_orderno: {type: String, trim: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("order", Schema);
