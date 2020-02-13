const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const stocklog = require("../../../../app/middlewares/stocklog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const StockModel = require("../../../../app/models/StockModel");
const CategorysModel = require("../../../../app/models/CategorysModel");
const ProductsModel = require("../../../../app/models/ProductsModel");

function stockList(req, res) {
  const obj = {};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = req.body.filterData.division;
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = req.session.branch;
  }

  if (req.body.filterData && req.body.filterData.startswith && req.body.filterData.startswith !== "") {
    obj.name = new RegExp(`^${req.body.filterData.startswith}`, "i");
  }
  if (!req.body.filterData.skip || req.body.filterData.skip === null || req.body.filterData.skip === "") {
    req.body.filterData.skip = 0;
  }
  if (!req.body.filterData.limit || req.body.filterData.limit === null || req.body.filterData.limit === "") {
    req.body.filterData.limit = 0;
  }
  const select = "created division_id category_id product_id product_name quantity";
  const prosel = "_id product_name product_code minimum_stock maximum_stock category_id";
  StockModel.find(obj, select).populate("division_id", "_id name").populate("product_id", prosel).populate("category_id", "_id name code")
    .skip(req.body.filterData.skip)
    .limit(req.body.filterData.limit)
    .exec((err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      res.send({success: true, data});
    });
}

router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `stock ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.post("/list", stockList);

router.get("/me", (req, res) => {
  StockModel.find({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

router.get("/initializedata/:id", (req, res) => {
  async.parallel([
    function (callback) {
      const query = StockModel.find({division_id: req.params.id}).populate("product_id", "_id category_id product_name")
        .populate("category_id", "_id name");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
      });
    },
    function (callback) {
      const query = CategorysModel.find({is_deleted: false}, "_id name");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
      });
    },
    function (callback) {
      const query = ProductsModel.find({is_deleted: false}, "_id category_id product_name");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }

    if (results === null || results[0] === null) {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }

    const obj = {};
    obj.stock = results[0] || [];
    obj.category = results[1] || [];
    obj.product = results[2] || [];

    return res.send({success: true, data: obj});
  });
});

// OPENING STOCK ITEM
router.post("/createopeningstock", (req, res) => {
  let stockDetail = new StockModel();
  // schema before save actions
  stockDetail = commonfunction.beforeSave(stockDetail, req);
  stockDetail.category_id = req.body.stockForm.category_id;
  stockDetail.product_id = req.body.stockForm.product_id;
  stockDetail.category_name = req.body.stockForm.category_name;
  stockDetail.product_name = req.body.stockForm.product_name;
  stockDetail.division_id = req.body.division_id;
  stockDetail.quantity = parseFloat(req.body.stockForm.quantity);

  stockDetail.save((errs, stockdata) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      return;
    } else if (stockdata && stockdata !== null && stockdata._id) {
      StockModel.findOne({_id: stockdata._id}).populate("division_id", "_id name").exec((err, stock) => {
        if (stock && stock !== null && stock._id) {
          const obj = {};
          obj.data = stock;
          obj.PAGE = "STOCK";
          obj.PURPOSE = "CREATE";
          const logdata = stocklog.createOpeningstock(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
        }
      });

      res.json({success: true, message: `Opening Stock for ${stockdata.product_name} inserted successfully`, data: stockdata});
      return;
    }
    res.json({success: false, message: "Oops! Something happened please try again later."});
  });
});

// Create / Update OPENING STOCK ITEM
router.post("/updateopeningstock", (req, res) => {
  if (req.body.stockData && req.body.stockData !== null && req.body.stockData !== "" && req.body.stockData.length > 0) {
    const stockUpdate = [];
    async.mapSeries(req.body.stockData, (stockDetail, callback) => {
      const obj = {};
      if (stockDetail._id) {
        const query = {_id: stockDetail._id};
        StockModel.findOne(query, (err, stockform) => {
          if (err) {
            obj.stockDetail = stockDetail;
            obj.status = "Failed";
            obj.action = "Update";
            stockUpdate.push(obj);
            return callback(errorhelper.getErrorMessage(err), null);
          } else if (stockform && stockform._id && stockform._id !== "") {
            if (parseFloat(stockform.quantity) !== parseFloat(stockDetail.quantity) || stockform.is_active !== stockDetail.is_active) {
              stockform = commonfunction.beforeSave(stockform, req);
              //                            var qty = parseFloat(stockDetail.quantity) - parseFloat(stockform.quantity);
              stockform.quantity = parseFloat(stockDetail.quantity);
              stockform.is_active = stockDetail.is_active;
              stockform.save((errs, stdetail) => {
                if (errs) {
                  obj.stockDetail = stockform;
                  obj.status = "Failed";
                  obj.action = "Update";
                  stockUpdate.push(obj);
                  return callback(errorhelper.getErrorMessage(errs), null);
                } else if (stdetail && stdetail !== null && stdetail._id) {
                  obj.stockDetail = stdetail;
                  obj.status = "Success";
                  obj.action = "Update";
                  stockUpdate.push(obj);
                  callback(null, stdetail);
                } else {
                  obj.stockDetail = stockform;
                  obj.status = "Failed";
                  obj.action = "Update";
                  stockUpdate.push(obj);
                  return callback("Oops! Something happened please try again later.", null);
                }
              });
            } else {
              obj.stockDetail = stockform;
              obj.status = "Failed";
              obj.action = "Update";
              stockUpdate.push(obj);
              return callback(null, stockform);
            }
          } else {
            obj.stockDetail = stockDetail;
            obj.status = "Failed";
            obj.action = "Update";
            stockUpdate.push(obj);
            return callback("Oops! Something happened please try again later.", null);
          }
        });
      } else {
        let stockdata = new StockModel();

        stockdata.category_id = stockDetail.category_id._id;
        stockdata.product_id = stockDetail.product_id._id;
        stockdata.product_name = stockDetail.product_name;
        stockdata.division_id = stockDetail.division_id;
        stockdata.quantity = parseFloat(stockDetail.quantity);
        stockdata.is_active = stockDetail.is_active;
        // schema before save actions
        stockdata = commonfunction.beforeSave(stockdata, req);

        stockdata.save((errs, stckdat) => {
          if (errs) {
            obj.stockDetail = stockDetail;
            obj.status = "Failed";
            obj.action = "Create";
            stockUpdate.push(obj);
            return callback(errorhelper.getErrorMessage(errs), null);
          } else if (stckdat && stckdat !== null && stckdat._id) {
            obj.stockDetail = stckdat;
            obj.status = "Success";
            obj.action = "Create";
            stockUpdate.push(obj);
            callback(null, stckdat);
          } else {
            obj.stockDetail = stockDetail;
            obj.status = "Failed";
            obj.action = "Create";
            stockUpdate.push(obj);
            return callback("Oops! Something happened please try again later.", null);
          }
        });
      }
    }, (err, result) => {
      if (err) {
        res.send({success: false, message: err});
        return;
      }

      if (stockUpdate.length > 0) {
        const obj = {};
        obj.data = stockUpdate;
        obj.PAGE = "STOCK";
        obj.PURPOSE = "UPDATE";
        const logdata = stocklog.updateOpeningstock(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }
      }
      res.send({success: true, message: "Stock details has been updated successfully"});
    });
  } else {
    res.json({success: false, message: "Stock details not found to update"});
  }
});

router.get("/listbyBranch", (req, res) => {
  if (typeof req.session.branch !== "undefined" && req.session.branch !== null && req.session.branch !== "") {
    const prodsel = "_id product_name product_code minimum_stock maximum_stock category_id";
    StockModel.find({division_id: req.session.branch}).populate("product_id", prodsel).populate("category_id", "_id name code").exec((err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      res.send({success: true, message: data});
    });
  } else if (typeof req.session.userrole !== "undefined" && req.session.userrole !== "superadmin") {
    res.send({success: false, message: "Stock details not found. Please, try again later!."});
  }
});

router.get("/getStockbydivision/:id", (req, res) => {
  if (req.params.id !== null && req.params.id !== "") {
    const select = "division_id product_id product_name quantity";
    const popselect = "product_name minimum_stock maximum_stock";
    StockModel.find({division_id: req.params.id}, select).populate("product_id", popselect).exec((err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.send({success: true, data});
      }
    });
  }
});

module.exports = router;
