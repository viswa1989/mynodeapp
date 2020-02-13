const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

function isunique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value && value.length) {
      let query = mongoose.model(modelName).where(field, new RegExp(`^${value}$`, caseSensitive ? "i" : undefined));
      query = query.where("_id").ne(this._id);

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
      {isAsync: true, validator: isunique("categorys", "name", true), msg: "Category already exists"},
    ]},
  code: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isunique("categorys", "code", true), msg: "Category code already exists"},
    ]},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

Schema.plugin(uniqueValidator);

module.exports = mongoose.model("categorys", Schema);
