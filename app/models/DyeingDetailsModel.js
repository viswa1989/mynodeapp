const mongoose = require("mongoose");

function isDyeingUnique(value, res) {
  if (value) {
    const id = this._id;
    const regex = new RegExp(`^${this.dyeing_name}$`, "i");
    mongoose.models.dyeingDetails.count({_id: {$ne: id}, dyeing_name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  dyeing_name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isDyeingUnique, msg: "Dyeing already exist"},
    ]},
  dyeing_address: {type: String, trim: true},
  dyeing_city: {type: String, trim: true},
  dyeing_pin: {type: String, trim: true},
  dyeing_contact_person: {type: String, trim: true},
  dyeing_email: {type: String, lowercase: true, trim: true},
  dyeing_phone: {type: String, trim: true},
  dyeing_picture: {type: String},
  gstin_no: {type: String, trim: true},
  pan_no: {type: String, trim: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true},
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("dyeingDetails", Schema);
