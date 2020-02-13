const mongoose = require("mongoose");

function isunique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      const id = this._id;
      let query = mongoose.model(modelName).where(field, new RegExp(`^${value}$`, caseSensitive ? "i" : undefined));

      query = query.where("_id").ne(id);

      query.count((err, n) => {
        respond(n < 1);
      });
    } else {
      respond(false);
    }
  };
}

const Schema = new mongoose.Schema({
  name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isunique("vendor", "name", true), msg: "Vendor name already exists"},
    ]},
  code: {type: String, trim: true},
  address: {type: String, trim: true},
  email: {type: String, lowercase: true, trim: true},
  mobile: {type: String, trim: true},
  contactperson_name: {type: String, trim: true},
  contactperson_email: {type: String, lowercase: true, trim: true},
  contactperson_mobile: {type: String, trim: true},
  gstin_no: {type: String, trim: true},
  pan_no: {type: String, trim: true},
  vendor_picture: {type: String},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("vendor", Schema);
