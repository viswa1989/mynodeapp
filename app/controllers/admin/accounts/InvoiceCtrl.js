const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const invoicepagelog = require("../../../../app/middlewares/invoicepagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const BillModel = require("../../../../app/models/BillModel");
const OrderModel = require("../../../../app/models/OrderModel");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");
const TaxModel = require("../../../../app/models/TaxesModel");
const StatelistModel = require("../../../../app/models/StatelistModel");
const GsttreatmentModel = require("../../../../app/models/GsttreatmentModel");
const ProcessModel = require("../../../../app/models/ProcessModel");
const PreferenceModel = require("../../../../app/models/PreferenceModel");
const CustomerModel = require("../../../../app/models/CustomersModel");
const _ = require("underscore");

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `items ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.post("/create", (req, res) => {
  if (req.body.invoiceForm.division_id && req.body.invoiceForm.division_id !== "" && req.body.invoiceForm.division_id !== null &&
            req.body.orderList && req.body.orderList !== "" && req.body.orderList !== null && req.body.orderList.length > 0) {
    DivisionaccountModel.findOne({division_id: req.body.invoiceForm.division_id}, "division_id invoice").exec((brancherr, Branchaccount) => {
      if (brancherr) {
        res.status(499).send({message: errorhelper.getErrorMessage(brancherr)});
      } else if (Branchaccount && Branchaccount !== null && Branchaccount._id && Branchaccount._id !== "" && Branchaccount.invoice &&
      Branchaccount.invoice.prefix && Branchaccount.invoice.serial_no && Branchaccount.invoice.prefix !== "" &&
      Branchaccount.invoice.serial_no !== "") {
        const invoice_no = `${Branchaccount.invoice.prefix}${Branchaccount.invoice.serial_no}`;
        const sno = Branchaccount.invoice.serial_no;

        let Bill = new BillModel(req.body.invoiceForm);
        Bill.invoice_no = invoice_no;
        Bill.serial_no = sno;
        Bill.type = "SALES";
        Bill.payment_status = "PENDING";
        Bill.paid = 0.00;
        Bill = commonfunction.beforeSave(Bill, req);

        Bill.save((inverrs, invData) => {
          if (inverrs) {
            res.status(499).send({message: errorhelper.getErrorMessage(inverrs)});
          } else if (invData && invData !== null && invData._id) {
            BillModel.findOne({_id: invData._id}).populate("division_id", "_id name").exec((inerr, invoice) => {
              if (inerr) {
                BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                res.status(499).send({message: errorhelper.getErrorMessage(inerr)});
              } else if (invoice && invoice !== null && invoice._id) {
                const ledquery = {_id: invoice.ledger_id};

                AccountledgerModel.findOneAndUpdate(ledquery, {$inc: {current_balance: invoice.total}, updated: new Date()}, (lederr, accledger) => {
                  if (lederr) {
                    BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                    res.status(499).send({message: errorhelper.getErrorMessage(lederr)});
                  } else if (accledger && accledger !== null && accledger._id) {
                    const brquery = {division_id: Branchaccount.division_id};

                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"invoice.serial_no": 1}}, (brerr) => {
                      if (brerr) {
                        BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                        AccountledgerModel.findOneAndUpdate(ledquery, {$inc: {current_balance: -1 * invoice.total}, updated: new Date()});
                        res.status(499).send({message: errorhelper.getErrorMessage(brerr)});
                        return;
                      }
                      req.completeditem = [];
                      req.loopcount = 0;

                      async.mapSeries(req.body.orderList, (orderID, callback) => {
                        req.loopcount += 1;
                        if (orderID && orderID !== null && orderID !== "") {
                          OrderModel.findOne({_id: orderID}).exec((jberr, jobs) => {
                            if (jberr) {
                              return callback(jberr, null);
                            } else if (jobs && jobs !== null && jobs._id) {
                              jobs = commonfunction.beforeSave(jobs, req);
                              jobs.order_status = "Invoice and Delivery";

                              jobs.save((jerr, jb) => {
                                if (jerr) {
                                  return callback(jerr, null);
                                } else if (jb && jb !== null && jb._id) {
                                  req.completeditem.push(jb);
                                  return callback(null, req.completeditem);
                                }
                                BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                                return callback(null, req.completeditem);
                              });
                            } else {
                              BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                              return callback(null, req.completeditem);
                            }
                          });
                        } else if (req.loopcount === req.body.orderList.length) {
                          return callback(null, invoice);
                        } else {
                          return callback(null, invoice);
                        }
                      }, (err, result) => {
                        if (err) {
                          BillModel.findByIdAndRemove(invData._id, (invoiceerr) => {});
                          DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"invoice.serial_no": -1}}, {upsert: true});
                          AccountledgerModel.findOneAndUpdate(ledquery, {$inc: {current_balance: -1 * invoice.total}, updated: new Date()},
                            {upsert: true});
                          if (req.completeditem && req.completeditem.length > 0) {
                            req.completeditem.forEach((jobdat) => {
                              if (jobdat._id && jobdat._id !== "") {
                                OrderModel.findByIdAndUpdate({_id: jobdat._id}, {order_status: "Completed"}, {upsert: true});
                              }
                            });
                            res.status(499).send({message: errorhelper.getErrorMessage(err)});
                            return;
                          }
                          res.status(499).send({message: errorhelper.getErrorMessage(err)});
                        } else if (req.completeditem && req.completeditem.length > 0) {
                          const obj = {};
                          obj.data = invoice;
                          obj.PAGE = "INVOICE";
                          const logdata = invoicepagelog.saveInvoice(obj, req);
                          if (logdata.message && logdata.message !== null) {
                            notificationlog.savelog(logdata, res);
                          }

                          return res.send({success: true, data: invoice});
                        }
                      });
                    });
                  } else {
                    return res.send({success: false, message: "Something went wrong please try again later!."});
                  }
                });
              } else {
                return res.send({success: false, message: "Something went wrong please try again later!."});
              }
            });
          } else {
            return res.send({success: false, message: "Something went wrong please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Prefix for invoice not found"});
      }
    });
  }
});

router.post("/update", (req, res) => {
  if (req.body.invoiceForm._id && req.body.invoiceForm._id !== null && req.body.invoiceForm._id !== "" &&
  req.body.invoiceForm.division_id && req.body.invoiceForm.division_id !== "" && req.body.invoiceForm.division_id !== null &&
  req.body.orderList && req.body.orderList !== "" && req.body.orderList !== null && req.body.orderList.length > 0) {
    BillModel.findOne({_id: req.body.invoiceForm._id}).populate("division_id", "_id name").exec((billerr, Bill) => {
      if (billerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(billerr)});
      } else if (Bill && Bill !== null && Bill._id) {
        const prevbill = Bill;

        Bill.billing_address = req.body.invoiceForm.billing_address;
        Bill.default_address = req.body.invoiceForm.default_address;
        Bill.customer_notes = req.body.invoiceForm.customer_notes;
        Bill.email_status = req.body.invoiceForm.email_status;
        Bill.invoice_date = req.body.invoiceForm.invoice_date;
        Bill.invoicedue_date = req.body.invoiceForm.invoicedue_date;
        Bill.items = req.body.invoiceForm.items;
        Bill.otheritems = req.body.invoiceForm.otheritems;
        Bill.subtotal = req.body.invoiceForm.subtotal;
        Bill.roundoff = req.body.invoiceForm.roundoff;
        Bill.tax_data = req.body.invoiceForm.tax_data;
        Bill.total = req.body.invoiceForm.total;
        Bill = commonfunction.beforeSave(Bill, req);

        Bill.save((inverrs, invoice) => {
          if (inverrs) {
            res.status(499).send({message: errorhelper.getErrorMessage(inverrs)});
          } else if (invoice && invoice !== null && invoice._id) {
            req.completeditem = [];
            req.loopcount = 0;

            async.mapSeries(req.body.orderList, (orders, callback) => {
              req.loopcount += 1;
              if (orders !== null && orders._id !== null && orders._id !== "") {
                OrderModel.findOne({_id: orders._id}).exec((jberr, jobs) => {
                  if (jberr) {
                    callback(jberr, req.completeditem);
                  } else if (jobs && jobs !== null && jobs._id) {
                    jobs = commonfunction.beforeSave(jobs, req);
                    jobs.order_status = orders.status;

                    jobs.save((jerr, jb) => {
                      if (jerr) {
                        return callback(jerr, req.completeditem);
                      } else if (jb && jb !== null && jb._id) {
                        req.completeditem.push(orders);
                        return callback(null, req.completeditem);
                      }
                      return callback("Job card not found", req.completeditem);
                    });
                  } else {
                    return callback("Job card not found", req.completeditem);
                  }
                });
              } else if (req.loopcount === req.body.orderList.length) {
                return callback(null, invoice);
              } else {
                return callback(null, invoice);
              }
            }, (err, result) => {
              if (err) {
                BillModel.findOneAndUpdate(prevbill, (errrem) => { });
                if (req.completeditem && req.completeditem.length > 0) {
                  req.completeditem.forEach((jobdat) => {
                    if (jobdat._id && jobdat._id !== "") {
                      let ordstat = "Completed";
                      if (jobdat.original_status && jobdat.original_status !== null) {
                        ordstat = jobdat.original_status;
                      }
                      OrderModel.findByIdAndUpdate({_id: jobdat._id}, {order_status: ordstat}, {upsert: true});
                    }
                  });
                  res.status(499).send({message: errorhelper.getErrorMessage(err)});
                  return;
                }
                res.status(499).send({message: errorhelper.getErrorMessage(err)});
              } else if (req.completeditem && req.completeditem.length > 0) {
                const obj = {};
                obj.data = invoice;
                obj.PAGE = "INVOICE";
                const logdata = invoicepagelog.updateInvoice(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }

                return res.send({success: true, data: invoice});
              }
            });
          } else {
            return res.send({success: false, message: "Oops! Something happened please try again later."});
          }
        });
      } else {
        return res.send({success: false, message: "Invoice not found"});
      }
    });
  }
});

router.get("/getInvoicedetails/:division_id", (req, res) => {
  if (req.params.division_id && req.params.division_id !== null && req.params.division_id !== "") {
    async.parallel([
      function (callback) {
        const select = "invoice";
        const condition = {division_id: req.params.division_id};
        const query = DivisionaccountModel.findOne(condition, select);

        query.exec((err, Inv) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Inv);
          }
        });
      },
      function (callback) {
        const query = AccountledgerModel.findOne({division_id: req.params.division_id, type: "INVOICE", default: true});

        query.exec((err, accountledger) => {
          if (err) {
            callback(err);
          } else {
            callback(null, accountledger);
          }
        });
      },
      function (callback) {
        const condition = {division_id: req.params.division_id, is_deleted: false, is_active: true};
        const popselect = "tax_name tax_percentage";
        const query = ProcessModel.find(condition, "division_id measurement tax_class inter_tax_class invoice_option")
          .populate("tax_class", popselect).populate("inter_tax_class", popselect);

        query.exec((err, process) => {
          if (err) {
            callback(err);
          } else {
            callback(null, process);
          }
        });
      },
      function (callback) { // Fetch Tax
        const select = "tax_name tax_percentage";
        const condition = {is_deleted: false, is_active: true};
        const query = TaxModel.find(condition, select);

        query.exec((err, Tax) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Tax);
          }
        });
      },
      function (callback) { // Fetch State list
        const query = StatelistModel.find({}).sort({name: "asc"});

        query.exec((err, State) => {
          if (err) {
            callback(err);
          } else {
            callback(null, State);
          }
        });
      },
      function (callback) { // Fetch GST Treatment list
        const query = GsttreatmentModel.find({});

        query.exec((err, Gst) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Gst);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      if (results === null || results[0] === null || results[1] === null || results[2] === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }

      const initData = {};
      initData.Invoice = results[0] || [];
      initData.Invoiceledger = results[1] || [];
      initData.Process = results[2] || [];
      initData.Tax = results[3] || [];
      initData.Statelistdetails = results[4] || [];
      initData.Gsttreatmentdetails = results[5] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/getInvoices/:id/:division_id/:type", (req, res) => {
  if (req.params.id && req.params.id !== "" && req.params.type && req.params.type !== "" && req.params.division_id && req.params.division_id !== "") {
    async.parallel([
      function (callback) { // Fetch invoice details
        const condition = {_id: req.params.id};
        const query = BillModel.findOne(condition);

        query.exec((err, Inv) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Inv);
          }
        });
      },
      function (callback) { // Fetch process details
        const condition = {division_id: req.params.division_id};
        const popselect = "tax_name tax_percentage";
        const query = ProcessModel.find(condition, "division_id measurement tax_class inter_tax_class")
          .populate("tax_class", popselect).populate("inter_tax_class", popselect);

        query.exec((err, process) => {
          if (err) {
            callback(err);
          } else {
            callback(null, process);
          }
        });
      },
      function (callback) { // Fetch Tax
        const select = "tax_name tax_percentage";
        const condition = {is_deleted: false, is_active: true};
        const query = TaxModel.find(condition, select);

        query.exec((err, Tax) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Tax);
          }
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

      const initData = {};
      initData.Invoice = results[0] || [];
      initData.Process = results[1] || [];
      initData.Tax = results[2] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/regenerateInvoice/:id/:division_id/:customerID", (req, res) => {
  if (req.params.id && req.params.id !== "" && req.params.customerID && req.params.customerID !== "" &&
  req.params.division_id && req.params.division_id !== "") {
    async.parallel([
      function (callback) { // Fetch State list
        const query = StatelistModel.find({}).sort({name: "asc"});

        query.exec((err, State) => {
          if (err) {
            callback(err);
          } else {
            callback(null, State);
          }
        });
      },
      function (callback) { // Fetch GST Treatment list
        const query = GsttreatmentModel.find({});

        query.exec((err, Gst) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Gst);
          }
        });
      },
      function (callback) {
        const query = CustomerModel.findOne({_id: req.params.customerID}, "name mobile_no address gstin gstTreatment placeofSupply group")
          .populate("group", "name group_discount");

        query.exec((err, cus) => {
          if (err) {
            callback(err);
          } else {
            callback(null, cus);
          }
        });
      },
      function (callback) { // Fetch Order details
        const condition = {customer_id: req.params.customerID,
          division_id: req.params.division_id,
          order_status: "Completed",
          is_deleted: false,
          is_active: true};
        let orderselect = "order_no orderPrice order_reference_no followupPerson contactperson order_date customer_dc_no ";
        orderselect += "customer_dc_date dyeing dyeing_dc_no dyeing_dc_date outward_delivery";
        const outwardselect = "order_id delivery_no outward_data is_return";

        OrderModel.find(condition, orderselect).populate("outward_delivery", outwardselect).exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            callback(null, orders);
          }
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

      const initData = {};
      initData.Statelistdetails = results[0] || [];
      initData.Gsttreatmentdetails = results[1] || [];
      initData.Customerdetails = results[2] || [];
      initData.Orderdetails = results[3] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.post("/getPendinginvoice", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.dueFrom !== null && req.body.dueTo !== null) {
    async.parallel([
      function (callback) { // Fetch invoice details
        const condition = {payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
        req.filters = commonfunction.filterdateBydays(req.body.dueFrom, req.body.dueTo);
        if (req.filters.startDate && req.filters.endDate && req.filters.startDate !== null && req.filters.endDate !== null &&
                        req.filters.startDate !== "" && req.filters.endDate !== "") {
          condition.invoicedue_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
        }

        if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
          condition.division_id = req.session.branch;
        } else if (req.body.divisionID !== "All") {
          condition.division_id = req.body.divisionID;
        }
        let select = "division_id invoice_no invoice_date invoicedue_date customer_id customer_name customer_mobile_no ";
        select += "total paid items.order_id items.order_no items.order_reference_no items.customer_dc_no items.dyeing_dc_no";
        const query = BillModel.find(condition, select).sort({invoice_date: "desc"});

        query.exec((err, Inv) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Inv);
          }
        });
      },
      function (callback) { // Fetch Total dues
        const select = "total paid";
        const conditions = {payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
        if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
          conditions.division_id = req.session.branch;
        } else if (req.body.divisionID !== "All") {
          conditions.division_id = req.body.divisionID;
        }

        BillModel.find(conditions, select).exec((err, billTotal) => {
          if (err) {
            callback(err);
          } else {
            callback(null, billTotal);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      const initData = {};
      initData.Pendingdue = results[0] || [];
      initData.Totalpending = results[1] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/viewinvoice/:id", (req, res) => {
  BillModel.findOne({_id: req.params.id}).exec((err, Inv) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send(Inv);
  });
});

router.get("/printInvoicedata/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    let hsn_codes = "";
    async.parallel([
      function (callback) { // Fetch invoice details
        const condition = {_id: req.params.id, is_deleted: false};
        let select = "invoice_no invoice_date invoicedue_date division_id customer_name customer_mobile_no placeofSupply billing_address ";
        select += "default_address customer_notes roundoff gstin total subtotal tax_data otheritems.itemname otheritems.qty otheritems.price ";
        select += "otheritems.subtotal otheritems.total otheritems.hsn_code items.delivery_no items.delivery_no items.delivery_roll ";
        select += "items.delivery_weight items.fabric_type items.fabric_color items.measurement items.process.process_id ";
        select += "items.process.process_name items.process.price items.process.subtotal items.process.total";
        const query = BillModel.findOne(condition, select).populate("placeofSupply", "name gts_code")
          .populate("division_id", "name").populate("items.process.process_id", "hsn_code");

        query.exec((err, Invoice) => {
          if (err) {
            callback(err);
          } else if (Invoice && Invoice !== null && Invoice._id) {
            const process = _.flatten(_.pluck(Invoice.items, "process"));
            const processdata = _.flatten(_.pluck(process, "process_id"));
            let hsndata = _.flatten(_.pluck(processdata, "hsn_code"));
            hsndata = _(hsndata).uniq();

            hsn_codes = hsndata.map((elem) => {
              return elem;
            }).join(", ");
            callback(null, Invoice);
          } else {
            callback(null, Invoice);
          }
        });
      },
      function (callback) { // Fetch Total dues
        PreferenceModel.find({module: "Company_info"}, "preference value", (err, preference) => {
          if (err) {
            callback(err);
          } else {
            const company_profile = {};
            async.each(preference, (pref, cb) => {
              if (pref.preference === 'address') {
                company_profile.address = pref.value;
              }
              if (pref.preference === 'phone_no') {
                company_profile.phone_no = pref.value;
              }
              if (pref.preference === 'email_id') {
                company_profile.email_id = pref.value;
              }
              if (pref.preference === 'gstin') {
                company_profile.gstin = pref.value;
              }

              cb(null);
            }, (errs) => {
              callback(null, company_profile);
            });
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (!results || results === null || !results[0] || results[0] === null) {
        res.status(499).send({message: "Invoice details not found."});
        return;
      }

      const initData = {};
      initData.Invoicedata = results[0] || [];
      initData.Companyprofile = results[1] || [];
      initData.hsn_codes = hsn_codes;

      return res.send({success: true, data: initData});
    });
  }
});

module.exports = router;
