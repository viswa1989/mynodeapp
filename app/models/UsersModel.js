let mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

function isUniqueuser(value, res) {
  if (value) {
    const regex = new RegExp(`^${value}$`, "i");
    const id = this._id;
    mongoose.models.users.count({_id: {$ne: id}, username: regex}, (err, count) => {
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
    const regex = new RegExp(`^${value}$`, "i");
    const id = this._id;
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
    const id = this._id;
    mongoose.models.users.count({_id: {$ne: id}, mobile_no: value}, (err, count) => {
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
    const id = this._id;
    mongoose.models.users.count({_id: {$ne: id}, alternate_no: value}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
  address: {type: String, trim: true, required: true},
  username: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isUniqueuser, msg: "username already exists"},
    ]},
  password: {type: String, trim: true, required: true},
  hash_password: {type: String, trim: true, required: true},
  email_id: {type: String,
    lowercase: true,
    trim: true,
    validate: [
      {isAsync: true, validator: isUniqueemail, msg: "Email address already exists"},
    ]},
  division: {type: mongoose.Schema.Types.ObjectId, ref: "division"},
  role: {type: Number, required: true},
  mobile_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquemobile, msg: "Mobile no already exists"},
    ],
    required: true},
  alternate_no: {type: Number,
    validate: [
      {isAsync: true, validator: isUniquealternate, msg: "Alternate no already exists"},
    ]},
  type: {type: String, trim: true, default: "user"},
  salary: {type: Number},
  join_date: {type: Date},
  profile_picture: {type: String},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  is_deleted: {type: Boolean, default: false},
  notification_seen: {type: Date},
});

Schema.pre("save", function (next) {
  if (this.role > 1 && !this.division) {
    return next(new Error("Select division"));
  }
  next();
});

Schema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model("users", Schema);
