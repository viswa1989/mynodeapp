const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);

function isProductUnique(value, res) {
  if (value) {
    const id = this._id;
    const regex = new RegExp(`^${this.product_name}$`, "i");
    const categoryid = this.category_id;
    mongoose.models.products.count({_id: {$ne: id}, product_name: regex, category_id: categoryid}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

function isProductcodeUnique(value, res) {
  if (value) {
    const id = this._id;
    const regex = new RegExp(`^${value}$`, "i");
    mongoose.models.products.count({_id: {$ne: id}, product_name: regex}, (err, count) => {
      if (err) {
        return res(err);
      }
      // If `count` is greater than zero, "invalidate"
      res(!count);
    });
  }
}

const Schema = new mongoose.Schema({
  product_name: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isProductUnique, msg: "Product name already exists"},
    ]},
  product_code: {type: String,
    trim: true,
    required: true,
    validate: [
      {isAsync: true, validator: isProductcodeUnique, msg: "Product code already exists"},
    ]},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  description: {type: String, trim: true},
  product_picture: {type: String},
  minimum_stock: {type: Float, required: true},
  maximum_stock: {type: Float, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model("products", Schema);
