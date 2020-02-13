const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 3);

const utilizedstockSchema = new mongoose.Schema({
  division_id: {type: mongoose.Schema.Types.ObjectId, ref: "division", required: true},
  category_id: {type: mongoose.Schema.Types.ObjectId, ref: "categorys", required: true},
  //    category_name: {type: String, required: true},
  product_id: {type: mongoose.Schema.Types.ObjectId, ref: "products", required: true},
  product_name: {type: String, required: true},
  availableStock: {type: Float, required: true},
  quantity: {type: Float, required: true},
  usedBy: {type: String, trim: true, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  updated_by: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
  created: {type: Date, required: true}, //* *it will validate the records new or exist record
  updated: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true, required: true},
  is_deleted: {type: Boolean, default: false, required: true},
}, {strict: true});

utilizedstockSchema.pre("save", function (next) {
  if (parseFloat(this.quantity) > 0) {
    const qty = parseFloat(this.quantity);
    this.quantity = qty;
  }
  next();
});


module.exports = mongoose.model("utilizedstock", utilizedstockSchema);
