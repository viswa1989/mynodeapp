const mongoose = require("mongoose");

function isDivisionUnique(value, res) {
  if (value) {
    const regex = new RegExp(`^${value}$`, "i");
    const id = this._id;
    mongoose.models.division.count({_id: {$ne: id}, name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const divisionSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true, validate: [{isAsync: true, validator: isDivisionUnique, msg: "Division name already exists"}]},
  location: {type: String, required: true, trim: true},
  placeofSupply: {type: mongoose.Schema.Types.ObjectId, ref: "statelist"},
  division_address: {
    address: {
      type: String, trim: true, required: true,
    },
    city: {
      type: String, trim: true, required: true,
    },
    state: {
      type: String, trim: true,
    },
    pin_code: {
      type: Number,
    },
  },
  billing_address: {
    company_name: {
      type: String, trim: true, required: true,
    },
    registration_no: {
      type: String, trim: true, required: true,
    },
    address_line: {
      type: String, trim: true, required: true,
    },
    city: {
      type: String, trim: true, required: true,
    },
    state: {
      type: String, trim: true, required: true,
    },
    pin_code: {
      type: Number, required: true,
    }},
  geolocation: {
    latitude: {
      type: Number, required: true,
    },
    longitude: {
      type: Number, required: true,
    }},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("division", divisionSchema);
