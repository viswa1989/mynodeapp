const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const stocklog = require("../../../../app/middlewares/stocklog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const StockModel = require("../../../../app/models/StockModel");
const UtilizedstockModel = require("../../../../app/models/UtilizedstockModel");
const CategorysModel = require("../../../../app/models/CategorysModel");
const ProductsModel = require("../../../../app/models/ProductsModel");

function stockList(req, res) {
  if (req.body.filterData && req.body.filterData !== "" && req.body.filterData.FromDate && req.body.filterData.ToDate &&
    req.body.filterData.FromDate !== "" && req.body.filterData.ToDate !== "" && req.body.filterData.division && req.body.filterData.division !== "") {
    const obj = {};

    req.filters = commonfunction.filterBydate(req.body.filterData.FromDate, req.body.filterData.ToDate);
    if (req.body.filterData.division !== "ALL") {
      obj.division_id = req.body.filterData.division;
    }
    obj.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    if (req.body.filterData && req.body.filterData.startswith && req.body.filterData.startswith !== "") {
      obj.name = new RegExp(`^${req.body.filterData.startswith}`, "i");
    }
    if (!req.body.filterData.skip || req.body.filterData.skip === null || req.body.filterData.skip === "") {
      req.body.filterData.skip = 0;
    }
    if (!req.body.filterData.limit || req.body.filterData.limit === null || req.body.filterData.limit === "") {
      req.body.filterData.limit = 0;
    }
    const select = "created division_id category_id product_id product_name quantity availableStock usedBy";

    UtilizedstockModel.find(obj, select).populate("division_id", "_id name")
      .populate("product_id", "_id category_id product_name").populate("category_id", "_id name")
      .skip(req.body.filterData.skip)
      .limit(req.body.filterData.limit)
      .exec((err, data) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else {
          res.send({success: true, data});
        }
      });
  }
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
    } else {
      res.json(data);
    }
  });
});

router.get("/initializedata/:id", (req, res) => {
  async.parallel([
    function (callback) {
      const query = StockModel.find({division_id: req.params.id});
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

router.post("/create", (req, res) => {
  if (req.body.stockForm) {
    if (!req.body.stockForm.division_id || req.body.stockForm.division_id === null || req.body.stockForm.division_id === "") {
      res.json({success: false, message: "Division details not found."});
      return;
    }
    const cond = {category_id: req.body.stockForm.category_id,
      product_id: req.body.stockForm.product_id,
      division_id: req.body.stockForm.division_id};
    StockModel.findOne(cond).exec((err, data) => {
      if (data && data !== null && data._id) {
        if (!data.quantity || data.quantity === null) {
          res.json({success: false, message: "Stock qunatity not found"});
          return;
        }
        if (parseFloat(data.quantity) < parseFloat(req.body.stockForm.quantity)) {
          res.json({success: false, message: "Qunatity exceed the available Stock qunatity."});
          return;
        }
        let utilzedstockdata = new UtilizedstockModel();
        // schema before save actions
        utilzedstockdata = commonfunction.beforeSave(utilzedstockdata, req);
        utilzedstockdata.category_id = req.body.stockForm.category_id;
        utilzedstockdata.product_id = req.body.stockForm.product_id;
        utilzedstockdata.category_name = req.body.stockForm.category_name;
        utilzedstockdata.product_name = req.body.stockForm.product_name;
        utilzedstockdata.division_id = req.body.stockForm.division_id;
        utilzedstockdata.quantity = parseFloat(req.body.stockForm.quantity);
        utilzedstockdata.availableStock = parseFloat(data.quantity);
        utilzedstockdata.usedBy = req.body.stockForm.usedBy;

        utilzedstockdata.save((errs, stockdata) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (stockdata && stockdata !== null && stockdata._id) {
            data = commonfunction.beforeSave(data, req);
            data.quantity = parseFloat(data.quantity) - parseFloat(stockdata.quantity);

            data.save((stockerr, availStock) => {
              if (availStock && availStock !== null && availStock._id) {
                const obj = {};
                obj.data = stockdata;
                obj.PAGE = "UTILIZED STOCK";
                obj.PURPOSE = "CREATE";
                const logdata = stocklog.createUtilizedstock(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }

                req.stockData = availStock;
                res.io.sockets.emit("updateStock", req.stockData);

                res.json({success: true, message: `Utilized Stock for ${stockdata.product_name} inserted successfully`, data: stockdata});
                return;
              }
              utilzedstockdata.findByIdAndRemove(stockdata._id, (uerr) => {});
              if (stockerr) {
                res.status(499).send({message: errorhelper.getErrorMessage(stockerr)});
              } else {
                res.json({success: false, message: "Oops! Something happened please try again later."});
              }
            });
          } else {
            res.json({success: false, message: "Oops! Something happened please try again later."});
          }
        });
      } else if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.json({success: false, message: "Stock details not found"});
      }
    });
  }
});

router.post("/update", (req, res) => {
  if (req.body.stockForm && req.body.stockForm._id) {
    if (!req.body.stockForm.division_id || req.body.stockForm.division_id === null || req.body.stockForm.division_id === "") {
      res.json({success: false, message: "Division details not found."});
      return;
    }
    const cond = {category_id: req.body.stockForm.category_id,
      product_id: req.body.stockForm.product_id,
      division_id: req.body.stockForm.division_id};
    StockModel.findOne(cond).exec((err, data) => {
      if (data && data !== null && data._id) {
        if (!data.quantity || data.quantity === null) {
          res.json({success: false, message: "Stock qunatity not found"});
          return;
        }

        UtilizedstockModel.findOne({_id: req.body.stockForm._id}).exec((errd, utilzedstockdata) => {
          if (errd) {
            res.status(499).send({message: errorhelper.getErrorMessage(errd)});
          } else if (utilzedstockdata && utilzedstockdata !== null && utilzedstockdata._id) {
            const qty = parseFloat(utilzedstockdata.quantity) - parseFloat(req.body.stockForm.quantity);
            const diff = parseFloat(data.quantity) + parseFloat(qty);
            const oldData = utilzedstockdata;
            if (diff >= 0 && parseFloat(data.quantity) < parseFloat(req.body.stockForm.quantity)) {
              res.json({success: false, message: "Qunatity exceed the available Stock qunatity."});
              return;
            }
            // schema before save actions
            utilzedstockdata = commonfunction.beforeSave(utilzedstockdata, req);
            utilzedstockdata.quantity = parseFloat(req.body.stockForm.quantity);
            utilzedstockdata.usedBy = req.body.stockForm.usedBy;

            utilzedstockdata.save((errs, stockdata) => {
              if (errs) {
                res.status(499).send({message: errorhelper.getErrorMessage(errs)});
              } else if (stockdata && stockdata !== null && stockdata._id) {
                data = commonfunction.beforeSave(data, req);
                data.quantity = parseFloat(data.quantity) + parseFloat(qty);

                data.save((stockerr, availStock) => {
                  if (availStock && availStock !== null && availStock._id) {
                    const obj = {};
                    obj.data = stockdata;
                    obj.PAGE = "UTILIZED STOCK";
                    obj.PURPOSE = "UPDATE";
                    const logdata = stocklog.updateUtilizedstock(obj, req);
                    if (logdata.message && logdata.message !== null) {
                      notificationlog.savelog(logdata, res);
                    }

                    req.stockData = availStock;
                    res.io.sockets.emit("updateStock", req.stockData);

                    res.json({success: true, message: `Utilized Stock for ${stockdata.product_name} updated successfully`, data: stockdata});
                    return;
                  }
                  utilzedstockdata.findByIdAndUpdate({_id: stockdata._id}, {quantity: oldData.quantity, usedBy: oldData.usedBy}, {upsert: true});
                  if (stockerr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(stockerr)});
                  } else {
                    res.json({success: false, message: "Oops! Something happened please try again later."});
                  }
                });
              } else {
                res.json({success: false, message: "Oops! Something happened please try again later."});
              }
            });
          } else {
            res.json({success: false, message: "Utilized Stock details not found"});
          }
        });
      } else if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.json({success: false, message: "Stock details not found"});
      }
    });
  }
});

router.post("/delete", (req, res) => {
  if (req.body.stockForm && req.body.stockForm._id) {
    if (!req.body.stockForm.division_id || req.body.stockForm.division_id === null || req.body.stockForm.division_id === "") {
      res.json({success: false, message: "Division details not found."});
      return;
    }
    const cond = {category_id: req.body.stockForm.category_id,
      product_id: req.body.stockForm.product_id,
      division_id: req.body.stockForm.division_id};
    StockModel.findOne(cond).exec((err, data) => {
      if (data && data !== null && data._id) {
        if (!data.quantity || data.quantity === null) {
          res.json({success: false, message: "Stock quantity not found"});
          return;
        }

        UtilizedstockModel.findOne({_id: req.body.stockForm._id}).exec((errd, utilzedstockdata) => {
          if (errd) {
            res.status(499).send({message: errorhelper.getErrorMessage(errd)});
          } else if (utilzedstockdata && utilzedstockdata !== null && utilzedstockdata._id) {
            // schema before save actions
            utilzedstockdata = commonfunction.beforeSave(utilzedstockdata, req);
            utilzedstockdata.is_deleted = true;

            utilzedstockdata.save((errs, stockdata) => {
              if (errs) {
                res.status(499).send({message: errorhelper.getErrorMessage(errs)});
              } else if (stockdata && stockdata !== null && stockdata._id) {
                data = commonfunction.beforeSave(data, req);
                data.quantity = parseFloat(data.quantity) + parseFloat(utilzedstockdata.quantity);

                data.save((stockerr, availStock) => {
                  if (availStock && availStock !== null && availStock._id) {
                    const obj = {};
                    obj.data = stockdata;
                    obj.PAGE = "UTILIZED STOCK";
                    obj.PURPOSE = "DELETE";
                    const logdata = stocklog.updateUtilizedstock(obj, req);
                    if (logdata.message && logdata.message !== null) {
                      notificationlog.savelog(logdata, res);
                    }

                    req.stockData = availStock;
                    res.io.sockets.emit("updateStock", req.stockData);

                    res.json({success: true, message: `Utilized Stock for ${stockdata.product_name} inserted successfully`, data: stockdata});
                    return;
                  }
                  utilzedstockdata.findByIdAndUpdate({_id: stockdata._id}, {is_deleted: false}, {upsert: true});
                  if (stockerr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(stockerr)});
                  } else {
                    res.json({success: false, message: "Oops! Something happened please try again later."});
                  }
                });
              } else {
                res.json({success: false, message: "Oops! Something happened please try again later."});
              }
            });
          } else {
            res.json({success: false, message: "Utilized Stock details not found"});
          }
        });
      } else if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.json({success: false, message: "Stock details not found"});
      }
    });
  }
});

module.exports = router;
