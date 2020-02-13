const mongoose = require("mongoose");

function isProcessUnique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value) {
      mongoose.model(modelName).where("_id").ne(this._id).where(field, value)
        .where("process_name", this.process_name)
        .where("contractor_id", this.contractor_id)
        .count((err, n) => {
          respond(n < 1);
        });
    } else {
      respond(false);
    }
  };
}

const Schema = new mongoose.Schema({
  process_name: {type: String, trim: true, required: true},
  subprocess_name: {type: String,
    trim: true,
    validate: [
      {isAsync: true, validator: isProcessUnique("contractorprocess", "subprocess_name", true), msg: "Sub Process already exists for this contractor"},
    ],
    required: true},
  contractor_id: {type: mongoose.Schema.Types.ObjectId, ref: "contractor", required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
});

Schema.pre("save", function (next) {
  // capitalize
  this.process_name.charAt(0).toUpperCase() + this.process_name.slice(1);
  this.subprocess_name.charAt(0).toUpperCase() + this.subprocess_name.slice(1);

  next();
});

module.exports = mongoose.model("contractorprocess", Schema);
