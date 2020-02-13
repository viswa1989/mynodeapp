const mongoose = require("mongoose");

function isUniqueuser(value, res) {
  if (value) {
    let id = this._id;
    let regex = new RegExp(`^${value}$`, "i");
    mongoose.models.users.count({_id: {$ne: id}, company_name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function isUniqueemail(value, res) {
  if (value) {
    let id = this._id;
    let regex = new RegExp(`^${value}$`, "i");
    mongoose.models.users.count({_id: {$ne: id}, email_id: regex}, (err, count) => {
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
    mongoose.models.users.count({_id: {$ne: this._id}, mobile_no: value}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function isUniquealternate(value, res) {
  if (value) {
    mongoose.models.users.count({_id: {$ne: this._id}, phone_no: value}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  company_name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUniqueuser, msg: "Company name already exists"},
    ]},
  phone_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquealternate, msg: "Phone no already exists"},
    ],
    required: true},
  email_id: {type: String,
    lowercase: true,
    trim: true,
    validate: [
      {isAsync: true, validator: isUniqueemail, msg: "Company email address already exists"},
    ],
    required: true},
  address1: {type: String, trim: true, required: true},
  address2: {type: String, trim: true},
  pin_code: {type: String, trim: true},
  contact_person: {type: String, trim: true, required: true},
  mobile_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquemobile, msg: "Mobile no already exists"},
    ],
    required: true},
  contactemail_id: {type: String,
    lowercase: true,
    trim: true,
    validate: [
      {isAsync: true, validator: isUniqueemail, msg: "Contact email address already exists"},
    ],
    required: true},
  gstin_number: {type: String, trim: true},
  pan_no: {type: String, trim: true},
  profile_picture: {type: String},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
});

module.exports = mongoose.model("contractor", Schema);
