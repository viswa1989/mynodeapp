const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

function isUniqueemail(value, res) {
  if (value) {
    mongoose.models.customers.count({ _id: {$ne: this._id }, email_id: value}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function isUniquemobile(value, res) {
  if (value) {
    mongoose.models.customers.count({ _id: {$ne: this._id }, $or: [{mobile_no: value}, {alternate_no: value}, {contactperson_mobile_no: value}, {"followup_person.mobile_no": value}]}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const customerSchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
  normalized_name: {type: String, trim: true, required: true},
  gstin: {type: String, trim: true},
  gstTreatment: {type: mongoose.Schema.Types.ObjectId, ref: "gsttreatment", required: true},
  placeofSupply: {type: mongoose.Schema.Types.ObjectId, ref: "statelist"},
  email_id: {type: String,
    lowercase: true,
    trim: true,
    validate: [
      {isAsync: true, validator: isUniqueemail, msg: "Email address already exists"},
    ]},
  mobile_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquemobile, msg: "Mobile no already exists"},
    ],
    required: true},
  alternate_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquemobile, msg: "Alternate no already exists"},
    ]},
  contact_person: {type: String, trim: true, required: true},
  contactperson_mobile_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquemobile, msg: "Mobile no already exists"},
    ],
    required: true},
  followup_person: [{
    name: {type: String, trim: true},
    mobile_no: {type: Number},
    email_id: {type: String, lowercase: true, trim: true},
    profile_picture: {type: String, trim: true},
    is_deleted: {type: Boolean, default: false},
  }],
  password: {type: String, trim: true},
  hash_password: {type: String, trim: true},
  address: [{
    company_name: {type: String, trim: true, required: true},
    gstin: {type: String, trim: true},
    address_line: {type: String, trim: true},
    area: {type: String, trim: true},
    city: {type: String, trim: true},
    state: {type: String, trim: true},
    landmark: {type: String, trim: true},
    pincode: {type: Number},
    contact_no: {type: Number},
    latitude: {type: String},
    longitude: {type: String},
    is_default: {type: Boolean, default: false, required: true},
    // is_delivery: {type: Boolean, default: false, required: true},
    is_invoice: {type: Boolean, default: false, required: true},
  }],
  opening_balance: {type: mongoose.Schema.Types.ObjectId, ref: "customeropeningbalances"},
  division_id: [{type: mongoose.Schema.Types.ObjectId, ref: "divisions"}],
  group: {type: mongoose.Schema.Types.ObjectId, ref: "customergroup"},
  is_favourite: {type: Boolean},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  status_inward: {type: Boolean, default: false},
  status_outward: {type: Boolean, default: false},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

customerSchema.pre("save", function (next) {
  if (this.normalized_name && this.normalized_name !== null && this.normalized_name !== "") {
    this.normalized_name = this.normalized_name.toLowerCase();
  }
  next();
});

customerSchema.path("address").validate((value, respond) => {
  if (value !== null && value !== "" && value.length > 0) {
    respond(true);
  } else {
    respond(false);
  }
}, "Please enter the company address");

customerSchema.path("division_id").validate((value, respond) => {
  if (value !== null && value !== "" && value.length > 0) {
    respond(true);
  } else {
    respond(false);
  }
}, "Division details not found for this customer");

customerSchema.path("gstin").validate((value, respond) => {
  if (value !== null && value !== "") {
    if (value.length === 15) {
      respond(true);
    } else {
      respond(false);
    }
  } else {
    respond(true);
  }
}, "GSTIN number must have 15 characters exactly");

customerSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model("customers", customerSchema);
