const mongoose = require("mongoose");
const commonfunction = require("../../../app/middlewares/commonfunction");
const _ = require('underscore');
const errorhelper = require("../../../app/helpers/errorhelper");
const async = require("async");
const express = require("express");

const router = express.Router();
const BillModel = require("../../../app/models/BillModel");
const PaymentledgerModel = require("../../../app/models/PaymentledgerModel");

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
        let select = "division_id invoice_no invoice_date invoicedue_date customer_id customer_name ";
        select += "customer_mobile_no total paid items.order_id items.order_no";
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

router.get("/getInvoices/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const obj = {};
    obj.is_deleted = false;
    obj.customer_id = mongoose.Types.ObjectId(req.params.id);
    const match = {$match: obj};
    const groupin = {$group: {_id: "$customer_id",
      Total_Sales: {$sum: "$total"},
      Total_Received: {$sum: "$paid"},
      pending_amount: {$sum: {$subtract: ["$total", "$paid"]}},
      closed_invoice: {$push: {$cond: [{$eq: ["$payment_status", "COMPLETED"]}, {invoice_id: "$_id",
        invoice_no: "$invoice_no",
        invoice_date: "$invoice_date",
        invoicedue_date: "$invoicedue_date",
        invoice_amount: "$total",
        balance_amount: {$sum: {$subtract: ["$total", "$paid"]}},
        payment_status: "$payment_status",
        job_detail: "$items"}, null]}}}};

    const project1 = {$project: {total: 1,
      paid: 1,
      payment_status: 1,
      invoice_no: 1,
      invoice_date: 1,
      invoicedue_date: 1,
      invoice_amount: 1,
      "items.order_id": 1,
      "items.order_no": 1,
      "items.order_date": 1}};
    // const project = {$project: {Total_Sales: 1, Total_Received: 1, pending_amount: 1, closed_invoice: 1, "closed_invoice.job_detail": 1}};
    const overduefilter = [0, 15, 30, 45, 60, 75];
    BillModel.aggregate(match, project1, groupin, (err, billDetails) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      if (billDetails && billDetails !== null && billDetails.length > 0) {
        const billdata = billDetails[0];
        if (billdata.closed_invoice) {
          billdata.closed_invoice = _.filter(billdata.closed_invoice, (value) => {
            return value !== null;
          });
        }
        const openinvoice = [];
        async.mapSeries(overduefilter, (due, callback) => {
          req.filters = {};
          if (due === 0) {
            req.filters = commonfunction.filterdateBydays(0, due);
          } else {
            req.filters = commonfunction.filterdateBydays(due - 15, due);
          }

          if (req.filters.startDate && req.filters.endDate && req.filters.startDate !== null && req.filters.endDate !== null &&
                req.filters.startDate !== "" && req.filters.endDate !== "") {
            const condition = {payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
            condition.customer_id = mongoose.Types.ObjectId(req.params.id);
            if (due === 0) {
              condition.invoicedue_date = {$gte: req.filters.endDate};
            } else if (due === 75) {
              condition.invoicedue_date = {$lte: req.filters.startDate};
            } else {
              condition.invoicedue_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
            }

            const select = "invoice_no invoice_date invoicedue_date total paid items.order_id items.order_no items.order_date";
            const query = BillModel.find(condition, select).sort({invoice_date: "desc"});

            query.exec((errdat, Inv) => {
              if (errdat) {
                callback(errdat);
              } else {
                let overdue = "";
                if (due > 0 && due < 75) {
                  overdue = due;
                }
                if (due <= 0) {
                  overdue = "On Due";
                }
                if (due > 60) {
                  overdue = "Exceed";
                }

                if (Inv && Inv.length > 0) {
                  async.each(Inv, (item, cb) => {
                    if (item._id) {
                      const pendingInv = {};
                      pendingInv.invoice_id = item._id;
                      pendingInv.invoice_no = item.invoice_no;
                      pendingInv.invoice_date = item.invoice_date;
                      pendingInv.invoicedue_date = item.invoicedue_date;
                      pendingInv.invoice_amount = item.total;
                      pendingInv.balance_amount = parseFloat(item.total) - parseFloat(item.paid);
                      pendingInv.job_detail = [];
                      if (item.items) {
                        item.items.forEach((ord) => {
                          pendingInv.job_detail.push({order_id: ord.order_id, order_no: ord.order_no, order_date: ord.order_date});
                        });
                      }
                      pendingInv.overdue = overdue;

                      openinvoice.push(pendingInv);
                    }
                    cb();
                  }, (errdt) => {
                    callback(null, Inv);
                  });
                } else {
                  callback(null, Inv);
                }
              }
            });
          }
        }, (errd, results) => {
          if (errd) {
            res.status(499).send({message: errorhelper.getErrorMessage(errd)});
            return;
          }
          billdata.open_invoice = openinvoice;
          billdata.overdues = [15, 30, 45, 60];
          return res.json({data: billdata});
        });
      } else {
        return res.json({data: billDetails});
      }
    });
  }
});

router.get("/view/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    let select = "paid payment_status customer_id customer_name customer_mobile_no billing_address gstin invoice_no subtotal ";
    select += "total invoice_date invoicedue_date customer_notes roundoff tax_data otheritems.itemname otheritems.subtotal ";
    select += "otheritems.qty otheritems.price otheritems.tax_class items.fabric_type items.fabric_color items.dia items.rolls ";
    select += "items.weight items.delivery_roll items.delivery_weight items.delivery_no items.order_no items.customer_dc_no ";
    select += "items.dyeing_dc_no items.process.process_name items.process.price items.process.subtotal items.process.total ";
    select += "items.process.tax_class";
    const query = BillModel.findOne({"items.order_id": req.params.id, is_deleted: false, is_active: true}, select);

    query.exec((err, invoice) => {
      if (err) {
        return res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (invoice && invoice !== null && invoice._id) {
        if (invoice.items && invoice.items !== null && invoice.items.length > 0) {
          const taxheader = _.flatten(_.pluck(invoice.tax_data, "tax_name"));
          let address = invoice.billing_address.billing_address_line;
          address += (invoice.billing_address.billing_area && invoice.billing_address.billing_area !== null &&
            invoice.billing_address.billing_area !== "") ? `, ${invoice.billing_address.billing_area}` : "";
          address += (invoice.billing_address.billing_city && invoice.billing_address.billing_city !== null &&
            invoice.billing_address.billing_city !== "") ? `, ${invoice.billing_address.billing_city}` : "";
          address += (invoice.billing_address.billing_state && invoice.billing_address.billing_state !== null &&
            invoice.billing_address.billing_state !== "") ? `, ${invoice.billing_address.billing_state}` : "";
          address += (invoice.billing_address.billing_pincode && invoice.billing_address.billing_pincode !== null &&
            invoice.billing_address.billing_pincode !== "") ? ` - ${invoice.billing_address.billing_pincode}` : "";

          let orders = _.flatten(_.pluck(invoice.items, "order_no"));
          orders = _(orders).uniq();

          const invoiceData = {};
          invoiceData.invoice_id = invoice._id;
          invoiceData.tax_data = invoice.tax_data.map((elem) => {
            return {name: `${elem.tax_percentage}% ${elem.tax_name}`, amount: elem.taxamount};
          });

          invoiceData.invoice_no = invoice.invoice_no;
          invoiceData.invoice_date = invoice.invoice_date;
          invoiceData.invoicedue_date = invoice.invoicedue_date;
          invoiceData.customer_id = invoice.customer_id;
          invoiceData.customer_name = invoice.customer_name;
          invoiceData.customer_mobile_no = invoice.customer_mobile_no;
          invoiceData.address = address;
          invoiceData.gstin = (invoice.gstin && invoice.gstin !== null) ? invoice.gstin : "";
          invoiceData.customer_notes = (invoice.customer_notes && invoice.customer_notes !== null) ? invoice.customer_notes : "";
          invoiceData.paid = invoice.paid;
          invoiceData.payment_status = invoice.payment_status;
          invoiceData.subtotal = invoice.subtotal;
          invoiceData.roundoff = (invoice.roundoff && invoice.roundoff !== null) ? invoice.roundoff : "0.00";
          invoiceData.total = invoice.total;
          if (invoice.otheritems && invoice.otheritems !== null && invoice.otheritems.length > 0) {
            invoiceData.otheritems = [];
            invoice.otheritems.map((elem) => {
              const ot = {};
              ot.item_name = elem.itemname;
              ot.qty = elem.qty;
              ot.price = elem.price;
              ot.subtotal = elem.subtotal;
              ot.tax_class = [];
              _.each(taxheader, (taxhead) => {
                const txamount = 0;
                const found = _.some(elem.tax_class, (el) => {
                  if (el.tax_name === taxhead) {
                    ot.tax_class.push(el.taxamount);
                  }
                  return el.tax_name === taxhead;
                });
                if (!found) {
                  ot.tax_class.push(txamount);
                }
              });
              invoiceData.otheritems.push(ot);
            });
          }


          invoiceData.order_no = orders.map((elem) => {
            return elem;
          }).join(", ");
          invoiceData.items = [];
          const payment_mode = [{key: "CASH", value: "Cash"}, {key: "BANK", value: "Cheque"}];
          async.mapSeries(invoice.items, (invoiceitem, callback) => {
            async.each(invoiceitem.process, (item, cb) => {
              const inv = {};
              inv.fabric_type = "";
              inv.fabric_color = "";
              inv.dia = "";
              inv.rolls = "";
              inv.weight = "";
              if (invoiceitem.process.indexOf(item) === 0) {
                inv.fabric_type = invoiceitem.fabric_type;
                inv.fabric_color = invoiceitem.fabric_color;
                inv.dia = invoiceitem.dia;
                inv.rolls = invoiceitem.rolls;
                inv.weight = invoiceitem.weight;
              }
              inv.delivery_roll = invoiceitem.delivery_roll;
              inv.delivery_weight = invoiceitem.delivery_weight;
              inv.delivery_no = invoiceitem.delivery_no;
              inv.order_no = invoiceitem.order_no;
              inv.customer_dc_no = invoiceitem.customer_dc_no;
              inv.dyeing_dc_no = invoiceitem.dyeing_dc_no;

              inv.process_name = item.process_name;
              inv.price = item.price;
              inv.subtotal = item.subtotal;
              //                            inv.total = item.total;
              inv.tax_class = [];
              if (item.tax_class && item.tax_class !== null && item.tax_class.length > 0) {
                async.each(taxheader, (taxhead, cbk) => {
                  const taxamount = 0;
                  const found = _.some(item.tax_class, (el) => {
                    if (el.tax_name === taxhead) {
                      inv.tax_class.push(el.taxamount);
                    }
                    return el.tax_name === taxhead;
                  });
                  if (!found) {
                    inv.tax_class.push(taxamount);
                  }
                  cbk();
                }, (errs) => {
                  invoiceData.items.push(inv);
                  cb(null);
                });
              } else {
                invoiceData.items.push(inv);
                cb();
              }
            }, (err) => {
              callback(null);
            });
          }, (errd) => {
            return res.json({tax_header: taxheader, invoiceData, payment_mode});
          });
        } else {
          return res.json([]);
        }
      } else {
        return res.json(invoice);
      }
    });
  }
});

router.post("/payment", (req, res) => {
  if (req.body.invoice_id && req.body.invoice_id !== null && req.body.invoice_id !== "") {
    BillModel.findOne({_id: req.body.invoice_id}, "paid payment_status total").exec((billerr, Bill) => {
      if (billerr) {
        return res.status(499).send({message: errorhelper.getErrorMessage(billerr)});
      } else if (Bill && Bill !== null && Bill._id) {
        if (Bill.payment_status === "Completed") {
          return res.status(499).send({message: "Payment for this invoice already completed."});
        }
        let Paymentledger = new PaymentledgerModel();
        Paymentledger.invoice_id = req.body.invoice_id;
        Paymentledger.customer_id = req.body.customer_id;
        Paymentledger.customer_name = req.body.customer_name;
        Paymentledger.payment_mode = req.body.payment_mode;
        Paymentledger.amount = req.body.amount;
        Paymentledger.status = "Open";
        Paymentledger = commonfunction.beforeSave(Paymentledger, req);

        Paymentledger.save((payerr, payData) => {
          if (payerr) {
            return res.status(499).send({message: errorhelper.getErrorMessage(payerr)});
          } else if (payData && payData !== null && payData._id) {
            return res.json({message: "Payment received successfully and waiting for admin confirmation"});
          }
          return res.status(499).send({message: "Something went wrong please try again later."});
        });
      } else {
        return res.status(499).send({message: "Invoice not found"});
      }
    });
  } else {
    return res.status(499).send({message: "Invoice not found"});
  }
});

module.exports = router;
