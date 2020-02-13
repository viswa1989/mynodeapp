const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);

function isStockUnique(value, res) {
  if (value) {
    mongoose.models.scrapstock.count({_id: {$ne: this._id}, item_id: value, division_id: this.division_id}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const scrapstockSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "branch", required: true},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  subcategory_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  brand_id: {type: mongoose.Schema.Types.ObjectId, ref: "brands", required: true},
  item_id: {type: mongoose.Schema.Types.ObjectId,
    ref: "items",
    validate: [
      {isAsync: true, validator: isStockUnique, msg: "Item already exists"},
    ],
    required: true},
  quantity: {type: Float, required: true},
  units: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

module.exports = mongoose.model("scrapstock", scrapstockSchema);
