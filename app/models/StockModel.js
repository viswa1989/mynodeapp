const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);

function isStockUnique(modelName, field, caseSensitive) {
  return function (value, respond) {
    if (value) {
      const id = this._id;
      const divisionid = this.division_id;
      mongoose.model(modelName).where("_id").ne(id).where(field, value)
        .where("division_id", divisionid)
        .count((err, n) => {
          respond(n < 1);
        });
    } else {
      respond(false);
    }
  };
}

const stockSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  product_id: {type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    validate: [
      {isAsync: true, validator: isStockUnique("stock", "product_id", true), msg: "Product already exists"},
    ],
    required: true},
  product_name: {type: String, required: true},
  quantity: {type: Float, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

stockSchema.pre("save", function (next) {
  if (parseFloat(this.quantity) > 0) {
    const qty = parseFloat(this.quantity);
    this.quantity = qty;
  }
  next();
});

stockSchema.path("quantity").validate(function (value, respond) {
  const self = this;
  this.constructor.findOne({_id: self._id, category_id: self.category_id, product_id: self.product_id}, (err, stocks) => {
    if (stocks) {
      if (self.id === stocks.id && self.quantity < 0) {
        return respond(false);
      }
      return respond(true);
    }
    respond(true);
  });
}, "Please add quantity before update stock");

module.exports = mongoose.model("stock", stockSchema);
