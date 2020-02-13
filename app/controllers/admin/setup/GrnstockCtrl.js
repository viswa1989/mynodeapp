const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const stocklog = require("../../../../app/middlewares/stocklog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const StockModel = require("../../../../app/models/StockModel");
const GrnstockModel = require("../../../../app/models/GrnstockModel");
const GrnreturnstockModel = require("../../../../app/models/GrnreturnstockModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const PurchaseorderModel = require("../../../../app/models/PurchaseorderModel");

function stockList(req, res) {
  StockModel.find({division_id: req.params.id}).populate("category_id subcategory_id brand_id item_id").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
}

function grnList(req, res) {
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
  const select = "created division_id grn_date grn_no invoice_no is_return po_id po_no stock_details total_amt vendor_id";

  GrnstockModel.find(obj, select).sort({grn_date: "desc"}).populate("vendor_id", "_id name").populate("division_id", "_id name")
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

function grnreturnList(req, res) {
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

  let select = "created division_id grn_date grn_id grn_no invoice_no po_id po_no return_amt return_date ";
  select += "return_no stock_details total_amt vendor_id";

  GrnreturnstockModel.find(obj, select).sort({return_date: "desc"}).populate("vendor_id", "_id name").populate("division_id", "_id name")
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

router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view", "getgrn"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `stock ${arr[4]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list/:id", stockList);
router.post("/grnlist", grnList);
router.post("/grnreturnlist", grnreturnList);

/* SAVE STOCK ITEM */
router.post("/create", (req, res) => {
  if (req.body.grnstockForm.stock_details && req.body.grnstockForm.stock_details.length > 0) {
    const condition = {division_id: req.session.branch, "grn.prefix": {$exists: true}};

    DivisionaccountModel.findOne(condition, (err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (data && data !== null && data._id && data.grn && data.grn.prefix && data.grn.serial_no &&
        data.grn.prefix !== "" && data.grn.serial_no !== "") {
        PurchaseorderModel.findOne({_id: req.body.grnstockForm.po_id, status: "APPROVED"}, (purerr, purdata) => {
          if (purerr) {
            res.status(499).send({message: errorhelper.getErrorMessage(purerr)});
          } else if (purdata && purdata !== null && purdata._id) {
            let newStock = new GrnstockModel({
              division_id: req.session.branch,
              grn_no: `${data.grn.prefix}${data.grn.serial_no}`,
              po_id: req.body.grnstockForm.po_id,
              po_no: req.body.grnstockForm.po_no,
              invoice_no: req.body.grnstockForm.invoice_no,
              grn_date: req.body.grnstockForm.grn_date,
              total_amt: parseFloat(req.body.grnstockForm.total_amt),
              vendor_name: req.body.grnstockForm.vendor_name,
              vendor_id: req.body.grnstockForm.vendor_id,
              stock_details: req.body.grnstockForm.stock_details,
            });

            newStock = commonfunction.beforeSave(newStock, req);

            newStock.save((errs, GRN) => {
              if (errs) {
                res.status(499).send({message: errorhelper.getErrorMessage(errs)});
              } else if (GRN && GRN !== null && GRN._id) {
                purdata.status = "DELIVERED";

                purdata.save((puerr, pudata) => {
                  if (puerr) {
                    PurchaseorderModel.findByIdAndUpdate({_id: purdata._id}, {status: "APPROVED"}, {upsert: true});
                    GrnstockModel.findByIdAndRemove(GRN._id, (gerr) => {});
                    res.status(499).send({message: errorhelper.getErrorMessage(puerr)});
                  } else if (pudata && pudata !== null && pudata._id) {
                    data = commonfunction.beforeSave(data, req);
                    data.grn.serial_no += 1;

                    data.save((derr, branch) => {
                      if (derr) {
                        PurchaseorderModel.findByIdAndUpdate({_id: pudata._id}, {status: "APPROVED"}, {upsert: true});
                        GrnstockModel.findByIdAndRemove(GRN._id, (gerr) => {});
                        res.status(499).send({message: errorhelper.getErrorMessage(derr)});
                      } else if (branch && branch !== null && branch._id) {
                        let stockinsert = true;
                        async.mapSeries(req.body.grnstockForm.stock_details, (stockDetail, callback) => {
                          const query = {division_id: req.session.branch, product_id: stockDetail.product_id};

                          StockModel.findOne(query, (erds, stockform) => {
                            req.executedstatement = "";

                            if (erds) {
                              stockinsert = false;
                              let objer = {};
                              objer.id = "";
                              objer.item = stockDetail.product_id;
                              objer.status = "failed";
                              req.executedstatement = objer;
                              objer = null;
                              return callback(null, req.executedstatement);
                            } else if (stockform && stockform._id && stockform._id !== "") {
                              stockform = commonfunction.beforeSave(stockform, req);
                              stockform.quantity = parseFloat(stockform.quantity) + parseFloat(stockDetail.quantity);

                              stockform.save((ers, stdetail) => {
                                if (ers || !stdetail) {
                                  let obj = {};
                                  obj.id = "";
                                  obj.item = stockDetail.product_id;
                                  obj.status = "failed";
                                  req.executedstatement = obj;
                                  obj = null;
                                  return callback(null, req.executedstatement);
                                } else if (stdetail && stdetail !== null && stdetail._id) {
                                  let objs = {};
                                  objs.id = stdetail._id;
                                  objs.item = stockDetail.product_id;
                                  objs.quantity = stockform.quantity;
                                  objs.status = "partial";
                                  req.executedstatement = objs;
                                  objs = null;
                                  return callback(null, req.executedstatement);
                                }
                              });
                            } else {
                              let stockdata = new StockModel();
                              // schema before save actions
                              stockdata = commonfunction.beforeSave(stockdata, req);
                              stockdata.category_id = stockDetail.category_id;
                              stockdata.product_id = stockDetail.product_id;
                              stockdata.product_name = stockDetail.product_name;
                              stockdata.division_id = req.session.branch;
                              stockdata.quantity = parseFloat(stockDetail.quantity);

                              stockdata.save((ers, stckdat) => {
                                if (ers || !stckdat) {
                                  stockinsert = false;
                                  let obj = {};
                                  obj.id = "";
                                  obj.item = stockDetail.product_id;
                                  obj.status = "failed";
                                  req.executedstatement = obj;
                                  obj = null;
                                  return callback(null, req.executedstatement);
                                } else if (stckdat && stckdat !== null && stckdat._id && stckdat._id !== "") {
                                  let objs = {};
                                  objs.id = stckdat._id;
                                  objs.item = stockDetail.product_id;
                                  objs.status = "new";
                                  req.executedstatement = objs;
                                  objs = null;
                                  return callback(null, req.executedstatement);
                                }
                              });
                            }
                          });
                        }, (errds, result) => {
                          if (errds) { return next(errds); }

                          let removedlen = 0;
                          let completed = 0;

                          result.forEach((stocks) => {
                            if (!stockinsert && stocks && typeof stocks !== "undefined" && stocks !== "" && stocks !== null &&
                            stocks.status && stocks.status !== null && stocks.status !== "" && (stocks.status === "partial" ||
                            stocks.status === "new" || stocks.status === "failed")) {
                              removedlen += 1;
                              if (stocks.status === "partial" && stocks.id && stocks.quantity) {
                                StockModel.findByIdAndUpdate({_id: stocks._id}, {$inc: {quantity: -1 * parseFloat(stocks.quantity)}},
                                  {upsert: true}, (errd) => {});
                              }
                              if (stocks.status === "new" && stocks.id) {
                                StockModel.findByIdAndRemove(stocks.id, (errd) => {});
                              }
                            }
                            completed += 1;
                          });

                          if (removedlen === req.body.grnstockForm.stock_details.length && !stockinsert) {
                            PurchaseorderModel.findByIdAndUpdate({_id: pudata._id}, {status: "APPROVED"}, {upsert: true}, (erd) => {});
                            GrnstockModel.findByIdAndRemove(GRN._id, (gerr) => {});
                            DivisionaccountModel.findByIdAndUpdate({_id: data._id}, {$inc: {"grn.serial_no": -1}}, {upsert: true}, (erd) => {});
                            res.send({success: false, message: "Something went wrong please try again later!.."});
                          } else if (GRN && GRN !== null && GRN._id && completed === req.body.grnstockForm.stock_details.length && stockinsert) {
                            GrnstockModel.findOne({_id: GRN._id}).populate("division_id", "_id name").exec((erds, stocks) => {
                              if (stocks && stocks !== null && stocks._id) {
                                const obj = {};
                                obj.data = stocks;
                                obj.PAGE = "GRN";
                                const logdata = stocklog.createGrn(obj, req);
                                if (logdata.message && logdata.message !== null) {
                                  notificationlog.savelog(logdata, res);
                                }
                              }
                            });
                            res.send({success: true, message: `New stock for the GRN ${GRN.grn_no} successfully created!`, data: GRN});
                          }
                        });
                      } else {
                        PurchaseorderModel.findByIdAndUpdate({_id: pudata._id}, {status: "APPROVED"}, {upsert: true});
                        GrnstockModel.findByIdAndRemove(GRN._id, (gerr) => {});
                        res.send({success: false, message: "Something went wrong please try again later!.."});
                      }
                    });
                  } else {
                    PurchaseorderModel.findByIdAndUpdate({_id: purdata._id}, {status: "APPROVED"}, {upsert: true});
                    GrnstockModel.findByIdAndRemove(GRN._id, (gerr) => {});
                    res.send({success: false, message: "Something went wrong please try again later!.."});
                  }
                });
              } else {
                res.send({success: false, message: "Something went wrong please try again later!.."});
              }
            });
          } else {
            res.send({success: false, message: "Purchase order for this grn not found"});
          }
        });
      } else {
        res.send({success: false, message: "GRN prefix is not found for this branch.Add prefix details for this branch to continue"});
      }
    });
  }
});

router.post("/update", (req, res) => {
  StockModel.findByIdAndUpdate(req.body.stockForm._id, req.body.stockForm, (err, stock) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, message: `Branch ${stock.name} successfully updated!`});
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  StockModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send("Brand successfully deleted!");
  });
});

// Get GRN prefix and serial; no to add stcok
router.get("/getgrn", (req, res) => {
  if (req.session.branch && req.session.branch !== "") {
    DivisionaccountModel.findOne({division_id: req.session.branch}, "grn", (err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.json(data);
      }
    });
  }
});

router.get("/getGrnautocomplete/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const query = GrnstockModel.find({grn_no: regex, division_id: req.session.branch, is_return: false},
    {grn_no: 1, _id: 1}).sort({created: -1}).limit(8);
  query.exec((err, grn) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data: grn});
  });
});

router.get("/getGrndetails/:id", (req, res) => {
  async.parallel([
    function (callback) { // Fetch branch account details by branch id
      //            var select = "_id division_id grn_date grn_no invoice_no po_id po_no stock_details total_amt vendor_id vendor_name";
      const query = GrnstockModel.findOne({_id: req.params.id});
      query.exec((err, Grnstock) => {
        if (err) {
          callback(err);
        }
        callback(null, Grnstock);
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

    const grnData = {};
    grnData.Grnstock = results[0] || [];

    return res.send({success: true, message: grnData});
  });
});

router.post("/createreturnStock", (req, res) => {
  if (req.body.grnreturnstockForm && req.body.grnreturnstockForm !== null && req.body.grnreturnstockForm.stock_details &&
    req.body.grnreturnstockForm.stock_details !== null && req.body.grnreturnstockForm.stock_details.length > 0) {
    DivisionaccountModel.findOne({division_id: req.session.branch, "purchase_return.prefix": {$exists: true}}, (acerr, actdata) => {
      if (acerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(acerr)});
      } else if (actdata && actdata !== null && actdata._id && actdata.purchase_return && actdata.purchase_return.prefix &&
        actdata.purchase_return.prefix !== null && actdata.purchase_return.prefix !== "" && actdata.purchase_return.serial_no &&
        actdata.purchase_return.serial_no !== null && actdata.purchase_return.serial_no !== "") {
        const condition = {_id: req.body.grnreturnstockForm.grn_id, division_id: req.body.grnreturnstockForm.division_id};

        GrnstockModel.findOne(condition, (purerr, purdata) => {
          if (purerr) {
            res.status(499).send({message: errorhelper.getErrorMessage(purerr)});
          } else if (purdata && purdata !== null && purdata._id) {
            let Grnreturnstock = new GrnreturnstockModel({
              return_no: `${actdata.purchase_return.prefix}${actdata.purchase_return.serial_no}`,
              division_id: req.body.grnreturnstockForm.division_id,
              grn_id: req.body.grnreturnstockForm.grn_id,
              grn_no: req.body.grnreturnstockForm.grn_no,
              grn_date: req.body.grnreturnstockForm.grn_date,
              return_date: new Date(),
              po_id: req.body.grnreturnstockForm.po_id,
              po_no: req.body.grnreturnstockForm.po_no,
              invoice_no: req.body.grnreturnstockForm.invoice_no,
              vendor_id: req.body.grnreturnstockForm.vendor_id,
              vendor_name: req.body.grnreturnstockForm.vendor_name,
              total_amt: req.body.grnreturnstockForm.total_amt,
              return_amt: parseFloat(req.body.grnreturnstockForm.return_amt),
              stock_details: req.body.grnreturnstockForm.stock_details,
            });

            Grnreturnstock = commonfunction.beforeSave(Grnreturnstock, req);

            Grnreturnstock.save((grnrterr, grtdata) => {
              if (grnrterr) {
                res.status(499).send({message: errorhelper.getErrorMessage(grnrterr)});
              } else if (grtdata && grtdata !== null && grtdata._id) {
                GrnstockModel.findByIdAndUpdate({_id: purdata._id}, {is_return: "true"}, (sers, sdat) => {
                  if (sers) {
                    res.status(499).send({message: errorhelper.getErrorMessage(sers)});
                  } else if (sdat && sdat !== null && sdat._id) {
                    actdata = commonfunction.beforeSave(actdata, req);
                    actdata.purchase_return.serial_no += 1;

                    actdata.save((err, branch) => {
                      if (err) {
                        GrnstockModel.findByIdAndUpdate({_id: purdata._id}, {is_return: "false"}, (gers) => {});
                        GrnreturnstockModel.findByIdAndRemove(grtdata._id, (ers) => {});
                        res.status(499).send({message: errorhelper.getErrorMessage(err)});
                      } else if (branch && branch !== null && branch._id) {
                        async.mapSeries(req.body.grnreturnstockForm.stock_details, (stockDetail, callback) => {
                            
                          const query = {division_id: req.body.grnreturnstockForm.division_id, product_id: stockDetail.product_id};
                          StockModel.findOne(query, (ersd, stockform) => {
                            req.executedstatement = "";
                            if (ersd || !stockform) {
                              const obj = {};
                              obj.id = "";
                              obj.item = stockDetail.product_id;
                              obj.status = "failed";
                              req.executedstatement = obj;
                              return callback(null, req.executedstatement);
                            } else if (stockform && stockform._id && stockform._id !== "") {
                              stockform = commonfunction.beforeSave(stockform, req);
                              stockform.quantity = parseFloat(stockform.quantity) - stockDetail.return_quantity;

                              stockform.save((erd, stdetail) => {
                                if (erd || !stdetail) {
                                  const obj = {};
                                  obj.id = "";
                                  obj.item = stockform.product_id;
                                  obj.status = "failed";
                                  req.executedstatement = obj;
                                  return callback(null, req.executedstatement);
                                } else if (stdetail && stdetail !== null && stdetail._id) {
                                  req.stocks = {};
                                  req.stocks.item_id = stockform.product_id;
                                  req.stocks.division_id = req.session.branch;
                                  req.stocks.quantity = -1 * parseInt(stockDetail.return_quantity);
                                  req.stocks.type = "single";
                                  res.io.sockets.emit("updateStocks", req.stocks);

                                  return callback(null, req.executedstatement);
                                }
                              });
                            }
                          });
                        }, (erd, result) => {
                          if (erd) { return next(erd); }

                          let removedlen = 0;
                          let completed = 0;

                          result.forEach((stocks) => {
                            if (stocks && typeof stocks !== "undefined" && stocks !== "" && stocks !== null && stocks.status &&
                            stocks.status !== null && stocks.status !== "" && (stocks.status === "partial" || stocks.status === "failed")) {
                              removedlen += 1;
                              if (stocks.id && stocks.status === "partial") {
                                // StockModel.findByIdAndRemove(stocks.id, function (err) {});
                              }
                            }
                            completed += 1;
                          });

                          if (removedlen === req.body.grnreturnstockForm.stock_details.length) {
                            GrnstockModel.findByIdAndUpdate({_id: purdata._id}, {is_return: "false"}, (gers) => {});
                            GrnreturnstockModel.findByIdAndRemove(grtdata._id, (ers) => {});
                            DivisionaccountModel.findByIdAndUpdate({_id: actdata._id}, {$inc: {"grn_return.serial_no": -1}}, {upsert: true},
                              (ders) => {});
                            res.send({success: false, message: "Something went wrong please try again later!.."});
                          } else if (grtdata && grtdata !== null && grtdata._id && completed === req.body.grnreturnstockForm.stock_details.length) {
                            GrnreturnstockModel.findOne({_id: grtdata._id}).populate("division_id", "_id name").exec((errs, stocks) => {
                              if (stocks && stocks !== null && stocks._id) {
                                const obj = {};
                                obj.data = stocks;
                                obj.PAGE = "RETURN STOCK";
                                const logdata = stocklog.createGrnreturn(obj, req);
                                if (logdata.message && logdata.message !== null) {
                                  notificationlog.savelog(logdata, res);
                                }
                              }
                            });
                            res.send({success: true, message: `Stock Return for GRN ${grtdata.grn_no} successfully created!`, data: grtdata});
                          }
                        });
                      } else {
                        GrnstockModel.findByIdAndUpdate({_id: purdata._id}, {is_return: "false"}, (gers) => {});
                        GrnreturnstockModel.findByIdAndRemove(grtdata._id, (ers) => {});
                        res.send({success: false, message: "Something went wrong please try again later!.."});
                      }
                    });
                  } else {
                    GrnreturnstockModel.findByIdAndRemove(grtdata._id, (ers) => {});
                    res.send({success: false, message: "Something went wrong please try again later!.."});
                  }
                });
              } else {
                res.send({success: false, message: "Something went wrong please try again later!.."});
              }
            });
          } else {
            res.send({success: false, message: "GRN details not found"});
          }
        });
      } else {
        res.send({success: false, message: "GRN Return prefix is not found for this branch.Add prefix details for this branch to continue"});
      }
    });
  }
});

module.exports = router;
