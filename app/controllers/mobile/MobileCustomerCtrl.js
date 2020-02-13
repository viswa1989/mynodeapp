const errorhelper = require("../../../app/helpers/errorhelper");
const mongoose = require("mongoose");
const async = require("async");
const express = require("express");

const router = express.Router();
const CustomerModel = require("../../../app/models/CustomersModel");
const CustomergroupsModel = require("../../../app/models/CustomergroupsModel");
const AccounttransModel = require("../../../app/models/AccounttransactionModel");
const DivisionModel = require("../../../app/models/DivisionsModel");

// function getcustomerids(customerID, callback) {
//   const cid = [];

//   async.mapSeries(customerID, (ids, callbk) => {
//     if (ids && ids !== null && ids._id) {
//       cid.push(mongoose.Types.ObjectId(ids._id));
//       callbk(null, ids);
//     } else {
//       callbk(null, ids);
//     }
//   }, (err) => {
//     // All tasks are done now
//     callback(null, cid);
//   });
// }

function userList(req, res) {
  const obj = {};
  if (!req.body.filterData.skip || req.body.filterData.skip === null || req.body.filterData.skip === "") {
    req.body.filterData.skip = 0;
  }

  if (req.body.filterData.is_pending && req.body.filterData.is_pending !== null) {
    obj.payment_status = { $ne: "COMPLETED" };
  }
  obj.is_deleted = false;

  if (req.body.filterData && req.body.filterData.favourites && req.body.filterData.favourites === true) {
    obj.is_favourite = req.body.filterData.favourites;
  }
  if (req.body.filterData && req.body.filterData.groups && req.body.filterData.groups !== "ALL" && req.body.filterData.groups !== "") {
    obj.group = mongoose.Types.ObjectId(req.body.filterData.groups);
  }

  if (!req.body.filterData.skip || req.body.filterData.skip === null || req.body.filterData.skip === "") {
    req.body.filterData.skip = 0;
  }
  if (req.body.filterData && req.body.filterData.searchtext && req.body.filterData.searchtext !== null && req.body.filterData.startswith !== "") {
    const re = new RegExp(req.body.filterData.searchtext, "i");
    obj.name = { $regex: re };
  }

  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "ALL" && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }

  const lookup = { $lookup: { from: "bills", localField: "_id", foreignField: "customer_id", as: "cus" } };

  const mtch = { $match: obj };

  const grp = {
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      normalized_name: { $first: "$normalized_name" },
      mobile_no: { $first: "$mobile_no" },
      favourite: { $first: "$is_favourite" },
      pending_invoice: { $sum: { $cond: [{$and: [{$eq: ["$cus.is_deleted", false]}, {$or: [{ $eq: ["$cus.payment_status", "PARTIAL"] },
        { $eq: ["$cus.payment_status", "PENDING"] }]}] }, 1, 0] } },
      pending_balance: { $sum: { $cond: [{$and: [{$eq: ["$cus.is_deleted", false]}, { $ne: ["$cus.payment_status", "COMPLETED"] }]},
        { $subtract: ["$cus.total", "$cus.paid"] }, 0] } },
      total_sales: { $sum: { $cond: [{$eq: ["$cus.is_deleted", false]}, "$cus.total", 0]}},
    },
  };
  // $and: [ { $gt: [ "$qty", 100 ] }, { $lt: [ "$qty", 250 ] } ]
  const srt = { $sort: { normalized_name: 1 } };
  if (req.body.filterData.sortby && req.body.filterData.sortby === "Z-A") {
    srt.$sort = { normalized_name: -1 };
  } else if (req.body.filterData.sortby && req.body.filterData.sortby === "High") {
    srt.$sort = { pending_balance: -1 };
  } else if (req.body.filterData.sortby && req.body.filterData.sortby === "Low") {
    srt.$sort = { pending_balance: 1 };
  } else {
    srt.$sort = { normalized_name: 1 };
  }

  const matchpending = { $match: { pending_balance: { $gte: 0 } } };
  if (req.body.filterData.is_pending && req.body.filterData.is_pending !== null) {
    matchpending.$match.pending_balance = { $gt: 0 };
  }

  // const proj = { $project: {
  //   _id: 1,
  //   name: 1,
  //   mobile_no: 1,
  //   is_favourite: 1,
  //   normalized_name: 1,
  //   cus: {
  //     $filter: {
  //       input: "$cus",
  //       as: "c",
  //       cond: { $eq: ["$$c.is_deleted", false] },
  //     },
  //   },
  // }};
  CustomerModel.aggregate(lookup, { $unwind: { path: "$cus", preserveNullAndEmptyArrays: true } }, mtch, grp, srt, matchpending,
    { $skip: req.body.filterData.skip }, { $limit: 25 }, (er, cdata) => {
      async.mapSeries(cdata, (customer, callback) => {
        const customerData = {};
        customerData._id = customer._id;
        customerData.name = customer.name;
        customerData.mobile_no = customer.mobile_no;
        customerData.favourite = false;
        if (customer.favourite) {
          customerData.favourite = customer.favourite;
        }
        customerData.total_sales = customer.total_sales;
        customerData.total_received = 0;
        customerData.pending_balance = customer.pending_balance;
        customerData.pending_invoice = customer.pending_invoice;

        const id = mongoose.Types.ObjectId(customer._id);

        const match = { $match: { payee_id: id, is_deleted: false } };
        const group = { $group: { _id: "$payee_id", total_transaction: { $sum: "$transaction_amount" } } };
        AccounttransModel.aggregate(match, group, (errd, trans) => {
          if (errd) {
            callback(errd, null);
          } else if (trans && trans !== null && trans.length > 0) {
            customerData.total_received = trans[0].total_transaction;
            callback(null, customerData);
          } else {
            callback(null, customerData);
          }
        });
      }, (err, results) => {
        if (err) {
          res.status(499).send({ message: errorhelper.getErrorMessage(err) });
          return;
        }

        return res.json(results);
      });
    });
}

router.post("/list", userList);

// Fetch all filter data
router.get("/getFilterdata", (req, res) => {
  async.parallel([
    function (callback) { // Fetch customer group details
      const query = CustomergroupsModel.find({}, "_id name default");
      query.exec((err, Customergroup) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Customergroup);
        }
      });
    },
    function (callback) { // Fetch all branch details
      const condition = { is_deleted: false, is_active: true };
      const query = DivisionModel.find(condition, "_id name");
      query.exec((err, Branchdetail) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Branchdetail);
        }
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    if (results === null || results[0] === null) {
      return res.send({ success: false, message: "Customer group filter detail not found" });
    }
    const filterData = {};
    const sortingfilter = [{key: "A-Z", value: "A - Z (Customer Name)"},
      {key: "Z-A", value: "Z - A  (Customer Name)"},
      {key: "High", value: "High - Low (Pending Balance)"},
      {key: "Low", value: "Low - High (Pending Balance)"}];
    filterData.Customergroup = results[0] || [];
    filterData.Divisions = results[1] || [];
    filterData.Sortingfilters = sortingfilter;

    return res.send({ success: true, data: filterData });
  });
});


router.get("/paymenthistory/:id/:skip", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = { payee_id: req.params.id, is_deleted: false };
    // let skiplist = 0;

    // if (req.params.skip && req.params.skip !== "" && req.params.skip !== null && parseInt(req.params.skip) > 0) {
    //   skiplist = parseInt(req.params.skip);
    // }
    const select = "bills type category_name transaction_type transaction_date transaction_amount division_id ledger_id memo";
    const query = AccounttransModel.find(condition, select).populate("division_id", "_id name").populate("ledger_id", "_id name")
      .sort({ transaction_date: "desc" })
      .skip()
      .limit(25)
      .lean();
    query.exec((ers, Transaction) => {
      if (ers) {
        res.status(499).send({ message: errorhelper.getErrorMessage(ers) });
      } else if (Transaction && Transaction !== null && Transaction.length > 0) {
        const transactionData = [];
        async.mapSeries(Transaction, (trans, callback) => {
          if (trans !== null && trans._id) {
            const tr = {};
            tr.transaction_id = trans._id;
            tr.division_name = trans.division_id.name;
            tr.category_name = trans.category_name;
            tr.transaction_date = trans.transaction_date;
            tr.transaction_amount = trans.transaction_amount;
            tr.ledger_name = trans.ledger_id.name;
            tr.memo = trans.memo;
            tr.bills = [];

            if (trans.bills && trans.bills !== null && trans.bills.length > 0) {
              async.each(trans.bills, (billdata, cb) => {
                if (billdata._id) {
                  const bill = {};
                  bill.bill_no = billdata.bill_no;
                  bill.bill_amount = billdata.amount;
                  bill.pending_due = parseFloat(billdata.balance_due) + parseFloat(billdata.amount_allocated);
                  bill.allocated_amt = billdata.amount_allocated;
                  bill.balance_due = billdata.balance_due;
                  tr.bills.push(bill);
                }
                cb();
              }, (err) => {
                transactionData.push(tr);
                callback(null, tr);
              });
            } else {
              transactionData.push(tr);
              callback(null, tr);
            }
          }
        }, (errd, results) => {
          if (errd) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errd) });
            return;
          }
          return res.json(transactionData);
        });
      } else {
        return res.json([]);
      }
    });
  }
});

module.exports = router;
