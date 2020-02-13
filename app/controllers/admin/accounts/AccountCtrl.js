const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const accountspagelog = require("../../../../app/middlewares/accountspagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");
const socketevents = require("../../../../app/config/socket");

const router = express.Router();
const async = require("async");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const DivisionsModel = require("../../../../app/models/DivisionsModel");
const AccountscategoryModel = require("../../../../app/models/AccountscategoryModel");
const AccounttransModel = require("../../../../app/models/AccounttransactionModel");
const BillModel = require("../../../../app/models/BillModel");
const CustomeropeningbalModel = require("../../../../app/models/CustomeropeningbalancesModel");
const CustomerModel = require("../../../../app/models/CustomersModel");

function accountList(req, res) { /** FUNCTIONS * */
  AccountledgerModel.find({}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
}

router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `accountscategory ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", accountList);

// Initilaize data for accounts
router.get("/initializedata", (req, res) => {
  async.parallel([
    function (callback) { // Fetch account ledger
      const condition = {is_deleted: false, is_active: true};
      if (req.session.branch && req.session.branch !== null) {
        condition.division_id = req.session.branch;
      }
      const query = AccountledgerModel.find(condition, "_id name type opening_date opening_balance current_balance division_id updated favourite");

      query.exec((err, Accountledger) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Accountledger);
        }
      });
    },
    function (callback) { // Fetch all division details
      const conditions = {is_deleted: false, is_active: true};
      if (req.session.branch && req.session.branch !== null) {
        conditions._id = req.session.branch;
      }
      const query = DivisionsModel.find(conditions, "_id name placeofSupply");

      query.exec((err, Branchdetail) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Branchdetail);
        }
      });
    },
    function (callback) { // Fetch sum of transaction for each division
      const match = {$match: {is_deleted: false, is_active: true}};
      const group = {$group: {_id: {ledger_id: "$ledger_id", transaction_type: "$transaction_type"}, total: {$sum: "$transaction_amount"}}};
      const query = AccounttransModel.aggregate(match, group);

      query.exec((err, ledgerTot) => {
        if (err) {
          callback(err);
        } else {
          callback(null, ledgerTot);
        }
      });
    },
    function (callback) { // Fetch sum of transaction for each division
      const match = {$match: {is_deleted: false, is_active: true}};
      const group = {$group: {_id: {ledger_id: "$ledger_id"}, total: {$sum: {$subtract: ["$total", "$paid"]}}}};
      const query = BillModel.aggregate(match, group);

      query.exec((err, billTot) => {
        if (err) {
          callback(err);
        } else {
          callback(null, billTot);
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

    const filterData = {};
    filterData.Ledgerdetail = results[0] || [];
    filterData.Branchdetail = results[1] || [];
    filterData.ledgerTotal = results[2] || [];
    filterData.billTotal = results[3] || [];
    filterData.Currentbranch = req.session.branch;

    return res.send({success: true, message: filterData});
  });
});

// Save / Create New Ledger Details
router.post("/createledger", (req, res) => {
  let newLedger = new AccountledgerModel({
    division_id: req.body.ledgerForm.division_id,
    type: req.body.ledgerForm.type,
    name: req.body.ledgerForm.name,
    default: false,
    opening_balance: parseFloat(req.body.ledgerForm.opening_balance),
    current_balance: parseFloat(req.body.ledgerForm.opening_balance),
  });

    // schema before save actions
  newLedger = commonfunction.beforeSave(newLedger, req);

  if (typeof req.body.ledgerForm.minimum_balance !== "undefined" && req.body.ledgerForm.minimum_balance !== null &&
  req.body.ledgerForm.minimum_balance !== "") {
    newLedger.minimum_balance = req.body.ledgerForm.minimum_balance;
  }
  if (typeof req.body.ledgerForm.financial_institution !== "undefined" && req.body.ledgerForm.financial_institution !== null &&
  req.body.ledgerForm.financial_institution !== "") {
    newLedger.financial_institution = req.body.ledgerForm.financial_institution;
  }
  if (typeof req.body.ledgerForm.account_no !== "undefined" && req.body.ledgerForm.account_no !== null && req.body.ledgerForm.account_no !== "") {
    newLedger.account_no = req.body.ledgerForm.account_no;
  }
  if (typeof req.body.ledgerForm.notes !== "undefined" && req.body.ledgerForm.notes !== null && req.body.ledgerForm.notes !== "") {
    newLedger.notes = req.body.ledgerForm.notes;
  }
  if (typeof req.body.ledgerForm.abbrevation !== "undefined" && req.body.ledgerForm.abbrevation !== null && req.body.ledgerForm.abbrevation !== "") {
    newLedger.abbrevation = req.body.ledgerForm.abbrevation;
  }
  if (typeof req.body.ledgerForm.favourite !== "undefined" && req.body.ledgerForm.favourite !== null && req.body.ledgerForm.favourite !== "") {
    newLedger.favourite = req.body.ledgerForm.favourite;
  }
  if (typeof req.body.ledgerForm.closed !== "undefined" && req.body.ledgerForm.closed !== null && req.body.ledgerForm.closed !== "") {
    newLedger.closed = req.body.ledgerForm.closed;
  }
  if (typeof req.body.ledgerForm.curreny !== "undefined" && req.body.ledgerForm.curreny !== null && req.body.ledgerForm.curreny !== "") {
    newLedger.curreny = req.body.ledgerForm.curreny;
  }
  if (typeof req.body.ledgerForm.interest_rate !== "undefined" && req.body.ledgerForm.interest_rate !== null &&
  req.body.ledgerForm.interest_rate !== "") {
    newLedger.interest_rate = req.body.ledgerForm.interest_rate;
  }
  if (typeof req.body.ledgerForm.opening_date !== "undefined" && req.body.ledgerForm.opening_date !== null &&
  req.body.ledgerForm.opening_date !== "") {
    newLedger.opening_date = req.body.ledgerForm.opening_date;
  }

  newLedger.save((err, ledger) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (ledger && ledger !== null && ledger._id) {
      AccountledgerModel.findOne({_id: ledger._id}).populate("division_id", "_id name").exec((errs, accledger) => {
        if (accledger && accledger !== null && accledger._id) {
          const obj = {};
          obj.data = accledger;
          obj.PAGE = "ACCOUNTS LEDGER";

          const logdata = accountspagelog.create(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
        }
      });

      res.send({success: true, message: `${ledger.name} ledger successfully created!`, data: ledger});
    } else {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }
  });
});

// Update existing ledger details
router.post("/updateledger", (req, res) => {
  AccountledgerModel.findOne({_id: req.body.ledgerForm._id}, (err, ledger) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (ledger && ledger !== null && ledger._id) {
        
      const obj = {};
      obj._id = ledger._id;
      if (parseFloat(req.body.ledgerForm.opening_balance) !== parseFloat(ledger.opening_balance)) {
          obj.opening_balance = parseFloat(req.body.ledgerForm.opening_balance) - parseFloat(ledger.opening_balance);
      }
      
      ledger.opening_balance = parseFloat(req.body.ledgerForm.opening_balance);
      
      // schema before save actions
      ledger = commonfunction.beforeSave(ledger, req);
      ledger.type = req.body.ledgerForm.type;
      ledger.name = req.body.ledgerForm.name;
      ledger.current_balance -= (ledger.opening_balance - req.body.ledgerForm.opening_balance);
      ledger.opening_balance = parseFloat(req.body.ledgerForm.opening_balance);

      if (typeof req.body.ledgerForm.minimum_balance !== "undefined" && req.body.ledgerForm.minimum_balance !== null &&
      req.body.ledgerForm.minimum_balance !== "") {
        ledger.minimum_balance = req.body.ledgerForm.minimum_balance;
      } else if (ledger.minimum_balance && ledger.minimum_balance !== null) {
        ledger.minimum_balance = 0;
      }

      if (typeof req.body.ledgerForm.financial_institution !== "undefined" && req.body.ledgerForm.financial_institution !== null &&
      req.body.ledgerForm.financial_institution !== "") {
        ledger.financial_institution = req.body.ledgerForm.financial_institution;
      } else if (ledger.financial_institution && ledger.financial_institution !== null) {
        ledger.financial_institution = "";
      }

      if (typeof req.body.ledgerForm.account_no !== "undefined" && req.body.ledgerForm.account_no !== null && req.body.ledgerForm.account_no !== "") {
        ledger.account_no = req.body.ledgerForm.account_no;
      } else if (ledger.account_no && ledger.account_no !== null) {
        ledger.account_no = "";
      }

      if (typeof req.body.ledgerForm.notes !== "undefined" && req.body.ledgerForm.notes !== null && req.body.ledgerForm.notes !== "") {
        ledger.notes = req.body.ledgerForm.notes;
      } else if (ledger.notes && ledger.notes !== null) {
        ledger.notes = "";
      }

      if (typeof req.body.ledgerForm.abbrevation !== "undefined" && req.body.ledgerForm.abbrevation !== null &&
      req.body.ledgerForm.abbrevation !== "") {
        ledger.abbrevation = req.body.ledgerForm.abbrevation;
      } else if (ledger.abbrevation && ledger.abbrevation !== null) {
        ledger.abbrevation = "";
      }

      if (typeof req.body.ledgerForm.favourite !== "undefined" && req.body.ledgerForm.favourite !== null && req.body.ledgerForm.favourite !== "") {
        ledger.favourite = req.body.ledgerForm.favourite;
      } else if (ledger.favourite && ledger.favourite !== null) {
        ledger.favourite = false;
      }

      if (typeof req.body.ledgerForm.closed !== "undefined" && req.body.ledgerForm.closed !== null && req.body.ledgerForm.closed !== "") {
        ledger.closed = req.body.ledgerForm.closed;
      } else if (ledger.closed && ledger.closed !== null) {
        ledger.closed = false;
      }

      if (typeof req.body.ledgerForm.curreny !== "undefined" && req.body.ledgerForm.curreny !== null && req.body.ledgerForm.curreny !== "") {
        ledger.curreny = req.body.ledgerForm.curreny;
      } else if (ledger.curreny && ledger.curreny !== null) {
        ledger.curreny = "";
      }

      if (typeof req.body.ledgerForm.interest_rate !== "undefined" && req.body.ledgerForm.interest_rate !== null &&
      req.body.ledgerForm.interest_rate !== "") {
        ledger.interest_rate = req.body.ledgerForm.interest_rate;
      } else if (ledger.interest_rate && ledger.interest_rate !== null) {
        ledger.interest_rate = 0;
      }

      if (typeof req.body.ledgerForm.opening_date !== "undefined" && req.body.ledgerForm.opening_date !== null &&
      req.body.ledgerForm.opening_date !== "") {
        ledger.opening_date = req.body.ledgerForm.opening_date;
      } else if (ledger.opening_date && ledger.opening_date !== null) {
        ledger.opening_date = "";
      }
      
      ledger.save((errs, ledgers) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (ledgers && ledgers !== null && ledgers._id) {
          AccountledgerModel.findOne({_id: ledgers._id}).populate("division_id", "_id name").exec((acerrs, accledger) => {
            if (accledger && accledger !== null && accledger._id) {
              const obj = {};
              obj.data = accledger;
              obj.PAGE = "ACCOUNTS LEDGER";

              const logdata = accountspagelog.update(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
            }
          });
          res.io.sockets.emit("ledgerdetails", obj);
          return res.send({success: true, message: `${ledgers.name} ledger successfully updated!`});
        }
        return res.send({success: false, message: "Something went wrong please try again later!."});
      });
    } else {
      return res.send({success: false, message: "Ledger not found"});
    }
  });
});

// Get Ledger Details by id
router.get("/getledgerDetails/:id/:type", (req, res) => {
  if (req.query.FromDate && req.query.FromDate !== null && req.query.FromDate !== "") {
    req.filters = commonfunction.filterBydate(req.query.FromDate, req.query.ToDate);
  }
  async.parallel([
    function (callback) { // Fetch all ledgers
      let select = "division_id type name default opening_balance minimum_balance financial_institution account_no notes ";
      select += "abbrevation favourite closed curreny interest_rate opening_date is_active is_deleted";

      const query = AccountledgerModel.findOne({_id: req.params.id}, select);

      query.exec((err, Ledger) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Ledger);
        }
      });
    },
    function (callback) { // Fetch all transaction for ledger
      const obj = {is_deleted: false, ledger_id: req.params.id};
      if (req.filters && req.filters.startDate && req.filters.startDate !== null && req.filters.startDate !=="") {
        if (req.params.type === "INVOICE") {
          obj.invoice_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
        } else {
          obj.transaction_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
        }
      }
      
      let query = AccounttransModel.find(obj).sort({transaction_date: -1}).limit(100);
      if (req.params.type === "INVOICE") {
        query = BillModel.find(obj).sort({invoice_date: -1}).limit(100);
      }

      query.exec((err, Transaction) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Transaction);
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

    const filterData = {};
    filterData.Ledgerdetail = results[0] || [];
    filterData.Transactiondetail = results[1] || [];

    return res.send({success: true, data: filterData});
  });
});

router.get("/getaccountCategoryDetails", (req, res) => {
  const query = AccountscategoryModel.find({is_deleted: false, is_active: true, nodeDisabled: "false"},
        "_id categoryType category_name level parent_uid uid");

  query.exec((err, Category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (Category && Category !== null) {
      return res.send({success: true, data: Category});
    } else {
      return res.send({success: false, message: "Account category details not found"});
    }
  });
});

// Get Ledger Details by id
router.get("/getTransaction/:id", (req, res) => {
  const query = AccounttransModel.findOne({_id: req.params.id});

  query.exec((err, trans) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (trans && trans !== null && trans._id) {
      if (trans.is_transfer && trans.reference_no && trans.reference_no !== "") {
        AccounttransModel.find({reference_no: trans.reference_no}, (errs, data) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            return;
          }
          return res.send({success: true, data});
        });
      } else if (trans.type !== "TRANSFER") {
        return res.send({success: true, data: trans});
      } else {
        return res.send({success: false, message: "Transactions not found"});
      }
    } else {
      return res.send({success: false, message: "Transactions not found"});
    }
  });
});

router.post("/saveTransaction", (req, res) => {
  if (req.body.transactionForm) {
    if (req.body.transactionForm.transaction_type !== "TRANSFER" && (typeof req.body.transactionForm.category_id === "undefined" ||
                req.body.transactionForm.category_id === "")) {
      return res.send({success: false, message: "Please select category"});
    }

    AccountledgerModel.findOne({_id: req.body.transactionForm.ledger_id}, (accerr, accdata) => {
      if (accerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(accerr)});
      } else if (accdata && accdata !== null && accdata._id) {
        if (!accdata.current_balance || accdata.current_balance === "") {
          accdata.current_balance = 0;
        }
        let currentbalance = parseFloat(accdata.current_balance) + parseFloat(req.body.transactionForm.transaction_amount);
        if (req.body.transactionForm.transaction_type === "DEBIT") {
          currentbalance = parseFloat(accdata.current_balance) - parseFloat(req.body.transactionForm.transaction_amount);
        }

        let accountTrans = new AccounttransModel({
          type: req.body.transactionForm.type,
          transaction_type: req.body.transactionForm.transaction_type,
          transaction_date: req.body.transactionForm.transaction_date,
          transaction_amount: req.body.transactionForm.transaction_amount,
          ledger_id: req.body.transactionForm.ledger_id,
          ledger_name: req.body.transactionForm.ledger_name,
          category_name: req.body.transactionForm.category_name,
          memo: req.body.transactionForm.memo,
          ledger_balance: currentbalance,
        });
        // schema before save actions
        accountTrans = commonfunction.beforeSavelargedata(accountTrans, req);

        if (typeof req.body.transactionForm.payee_name !== "undefined" && req.body.transactionForm.payee_name !== null &&
        req.body.transactionForm.payee_name !== "") {
          accountTrans.payee_name = req.body.transactionForm.payee_name;
        }
        if (typeof req.body.transactionForm.division_id !== "undefined" && req.body.transactionForm.division_id !== null &&
        req.body.transactionForm.division_id !== "") {
          accountTrans.division_id = req.body.transactionForm.division_id;
        }
        if (typeof req.body.transactionForm.branch_name !== "undefined" && req.body.transactionForm.branch_name !== null &&
        req.body.transactionForm.branch_name !== "") {
          accountTrans.branch_name = req.body.transactionForm.branch_name;
        }
        if (typeof req.body.transactionForm.category_id !== "undefined" && req.body.transactionForm.category_id !== null &&
        req.body.transactionForm.category_id !== "") {
          accountTrans.category_id = req.body.transactionForm.category_id;
        }
        if (typeof req.body.transactionForm.cheque_no !== "undefined" && req.body.transactionForm.cheque_no !== null &&
        req.body.transactionForm.cheque_no !== "") {
          accountTrans.cheque_no = req.body.transactionForm.cheque_no;
        }

        accountTrans.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {
            accdata = commonfunction.beforeSave(accdata, req);
            accdata.current_balance = Trans.ledger_balance;

            accdata.save((lederr, ledgers) => {
              if (lederr) {
                AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                res.status(499).send({message: errorhelper.getErrorMessage(lederr)});
              } else if (ledgers && ledgers !== null && ledgers._id) {
                const obj = {};
                obj.data = Trans;
                obj.PAGE = "ACCOUNTS TRANSACTION";

                const logdata = accountspagelog.createTrans(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }
                res.io.sockets.emit("newledgertrans", Trans);
                return res.send({success: true, message: "Transaction successfully created!", data: Trans});
              } else {
                return res.send({success: false, message: "Something went wrong please try again later!."});
              }
            });
          } else {
            return res.send({success: false, message: "Something went wrong please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Ledger not found"});
      }
    });
  }
});

router.post("/updateTransaction", (req, res) => {
  if (req.body.transactionForm && req.body.transactionForm._id && req.body.transactionForm._id !== "") {
    if (req.body.transactionForm.transaction_type !== "TRANSFER" && (typeof req.body.transactionForm.category_id === "undefined" ||
                req.body.transactionForm.category_id === "")) {
      return res.send({success: false, message: "Please select category"});
    }

    AccountledgerModel.findOne({_id: req.body.transactionForm.ledger_id}, (accerr, accdata) => {
      if (accerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(accerr)});
      } else if (accdata && accdata !== null && accdata._id) {
        AccounttransModel.findOne({_id: req.body.transactionForm._id}, (errs, transdata) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (transdata && transdata !== null && transdata._id) {
            const previoustrans = JSON.parse(JSON.stringify(transdata));

            transdata = commonfunction.beforeSavelargedata(transdata, req);

            if (typeof req.body.transactionForm.transaction_date !== "undefined" &&
            req.body.transactionForm.transaction_date !== null && req.body.transactionForm.transaction_date !== "") {
              transdata.transaction_date = req.body.transactionForm.transaction_date;
            }
            if (typeof req.body.transactionForm.transaction_amount !== "undefined" &&
            req.body.transactionForm.transaction_amount !== null && req.body.transactionForm.transaction_amount !== "") {
              transdata.transaction_amount = req.body.transactionForm.transaction_amount;
            }
            if (typeof req.body.transactionForm.memo !== "undefined" && req.body.transactionForm.memo !== null &&
            req.body.transactionForm.memo !== "") {
              transdata.memo = req.body.transactionForm.memo;
            }
            if (typeof req.body.transactionForm.cheque_no !== "undefined" && req.body.transactionForm.cheque_no !== null &&
            req.body.transactionForm.cheque_no !== "") {
              transdata.cheque_no = req.body.transactionForm.cheque_no;
            }
            if (typeof req.body.transactionForm.category_id !== "undefined" && req.body.transactionForm.category_id !== null &&
            req.body.transactionForm.category_id !== "") {
              transdata.category_id = req.body.transactionForm.category_id;
            }
            if (typeof req.body.transactionForm.category_name !== "undefined" && req.body.transactionForm.category_name !== null &&
            req.body.transactionForm.category_name !== "") {
              transdata.category_name = req.body.transactionForm.category_name;
            }
            if (typeof req.body.transactionForm.payee_name !== "undefined" && req.body.transactionForm.payee_name !== null &&
            req.body.transactionForm.payee_name !== "") {
              transdata.payee_name = req.body.transactionForm.payee_name;
            }
            const amoundiff = transdata.transaction_amount - parseFloat(req.body.transactionForm.transaction_amount);

            let currentbalance = parseFloat(accdata.current_balance) + parseFloat(-1 * amoundiff);
            if (req.body.transactionForm.transaction_type === "DEBIT") {
              currentbalance = parseFloat(accdata.current_balance) + parseFloat(amoundiff);
            }
            transdata.ledger_balance = currentbalance;

            transdata.save((err, Trans) => {
              if (err) {
                res.status(499).send({message: errorhelper.getErrorMessage(err)});
              } else if (Trans && Trans !== null && Trans._id) {
                accdata = commonfunction.beforeSave(accdata, req);
                accdata.current_balance = Trans.ledger_balance;

                accdata.save((lederr, ledgers) => {
                  if (lederr) {
                    let accountTrans = new AccounttransModel({});
                    accountTrans = previoustrans;
                    accountTrans.save((e) => {});
                    res.status(499).send({message: errorhelper.getErrorMessage(lederr)});
                    return;
                  } else if (ledgers && ledgers !== null && ledgers._id) {
                    const obj = {};
                    obj.data = Trans;
                    obj.olddata = previoustrans;
                    obj.PAGE = "ACCOUNTS TRANSACTION";

                    const logdata = accountspagelog.updateTrans(obj, req);
                    if (logdata.message && logdata.message !== null) {
                      notificationlog.savelog(logdata, res);
                    }
                    const trdetails = {};
                    trdetails.newtrans = Trans;
                    trdetails.oldtrans = previoustrans;
                    res.io.sockets.emit("updateledgertrans", trdetails);
                    res.send({success: true, message: "Transaction successfully updated!", data: Trans});
                    return;
                  }
                  return res.send({success: false, message: "Oops something happened please try again later."});
                });
              } else {
                return res.send({success: false, message: "Oops something happened please try again later."});
              }
            });
          } else {
            return res.send({success: false, message: "Transactions not found"});
          }
        });
      } else {
        return res.send({success: false, message: "Ledger not found"});
      }
    });
  }
});

router.post("/saveTransfer", (req, res) => {
  if (req.body.fromledger && req.body.toledger) {
    if (req.body.fromledger.type !== "TRANSFER") {
      return res.send({success: false, message: "Oops something happened please try again later!."});
    }
    if (req.body.toledger.type !== "TRANSFER") {
      return res.send({success: false, message: "Oops something happened please try again later!."});
    }

    if (typeof req.body.fromledger.ledger_id === "undefined" || req.body.fromledger.ledger_id === "") {
      return res.send({success: false, message: "Please select the ledger from which the amount is going to transfer"});
    }

    if (typeof req.body.toledger.ledger_id === "undefined" || req.body.toledger.ledger_id === "") {
      return res.send({success: false, message: "Please select the ledger to which the amount is going to receive"});
    }

    AccountledgerModel.findOne({_id: req.body.fromledger.ledger_id}, (fromaccerr, fromaccdata) => {
      if (fromaccerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(fromaccerr)});
      } else if (fromaccdata && fromaccdata !== null && fromaccdata._id) {
        const currentbalance = parseFloat(fromaccdata.current_balance) - parseFloat(req.body.fromledger.transaction_amount);

        let accountTrans = new AccounttransModel({
          type: req.body.fromledger.type,
          transaction_type: req.body.fromledger.transaction_type,
          transaction_date: req.body.fromledger.transaction_date,
          transaction_amount: req.body.fromledger.transaction_amount,
          ledger_id: req.body.fromledger.ledger_id,
          ledger_name: req.body.fromledger.ledger_name,
          category_name: "Transfer",
          memo: req.body.fromledger.memo,
          ledger_balance: currentbalance,
        });

        if (typeof req.body.fromledger.division_id !== "undefined" && req.body.fromledger.division_id !== null &&
        req.body.fromledger.division_id !== "") {
          accountTrans.division_id = req.body.fromledger.division_id;
        }
        if (typeof req.body.fromledger.branch_name !== "undefined" && req.body.fromledger.branch_name !== null &&
        req.body.fromledger.branch_name !== "") {
          accountTrans.branch_name = req.body.fromledger.branch_name;
        }
        // schema before save actions
        accountTrans = commonfunction.beforeSavetransfer(accountTrans, req);

        if (typeof req.body.fromledger.cheque_no !== "undefined" && req.body.fromledger.cheque_no !== null && req.body.fromledger.cheque_no !== "") {
          accountTrans.cheque_no = req.body.fromledger.cheque_no;
        }
        accountTrans.reference_no = new Date().getTime() + Math.random();

        accountTrans.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans._id && Trans._id !== "") {
            fromaccdata = commonfunction.beforeSave(fromaccdata, req).toObject();
            delete fromaccdata.current_balance;

            const update = {$set: fromaccdata, $inc: {current_balance: -1 * parseFloat(req.body.fromledger.transaction_amount)}};

            AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id, update, (lederr, ledgers) => {
              // fromaccdata.save(function(lederr,ledgers) {
              if (lederr) {
                AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                res.status(499).send({message: errorhelper.getErrorMessage(lederr)});
              } else if (ledgers && ledgers !== null && ledgers._id) {
                AccountledgerModel.findOne({_id: req.body.toledger.ledger_id}, (toaccerr, toaccdata) => {
                  if (toaccerr) {
                    AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                      {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    res.status(499).send({message: errorhelper.getErrorMessage(toaccerr)});
                  } else if (toaccdata && toaccdata !== null && toaccdata._id) {
                    let tobalance = parseFloat(req.body.toledger.transaction_amount);
                    if (toaccdata.current_balance && toaccdata.current_balance !== null) {
                        const tobalance = parseFloat(tobalance) + parseFloat(toaccdata.current_balance);
                    }
                    
                    let TransData = new AccounttransModel({
                      type: req.body.toledger.type,
                      transaction_type: req.body.toledger.transaction_type,
                      transaction_date: req.body.toledger.transaction_date,
                      transaction_amount: req.body.toledger.transaction_amount,
                      ledger_id: req.body.toledger.ledger_id,
                      ledger_name: req.body.toledger.ledger_name,
                      category_name: "Transfer",
                      memo: req.body.toledger.memo,
                      ledger_balance: tobalance,
                    });
                    if (typeof req.body.toledger.division_id !== "undefined" && req.body.toledger.division_id !== null &&
                    req.body.toledger.division_id !== "") {
                      TransData.division_id = req.body.toledger.division_id;
                    }
                    if (typeof req.body.toledger.branch_name !== "undefined" && req.body.toledger.branch_name !== null &&
                    req.body.toledger.branch_name !== "") {
                      TransData.branch_name = req.body.toledger.branch_name;
                    }
                    TransData = commonfunction.beforeSavetransfer(TransData, req);

                    if (typeof req.body.toledger.cheque_no !== "undefined" && req.body.toledger.cheque_no !== null &&
                    req.body.toledger.cheque_no !== "") {
                      TransData.cheque_no = req.body.toledger.cheque_no;
                    }
                    TransData.reference_no = Trans.reference_no;

                    TransData.save((errs, toTrans) => {
                      if (errs) {
                        AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                        AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                          {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
                      } else if (toTrans && toTrans !== null && toTrans._id) {
                        toaccdata = commonfunction.beforeSave(toaccdata, req).toObject();
                        delete toaccdata.current_balance;
                        const updateto = {$set: toaccdata, $inc: {current_balance: parseFloat(req.body.toledger.transaction_amount)}};

                        AccountledgerModel.findByIdAndUpdate(req.body.toledger.ledger_id, updateto, (tolederr, toledgers) => {
                          // toaccdata.save(function(tolederr,toledgers) {
                          if (tolederr) {
                            AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                            AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                              {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                            AccounttransModel.findByIdAndRemove(toTrans._id, (errrem) => { });
                            res.status(499).send({message: errorhelper.getErrorMessage(tolederr)});
                            return;
                          } else if (toledgers && toledgers !== null && toledgers._id) {
                            const obj = {};
                            obj.data = {};
                            obj.data.from = Trans;
                            obj.data.to = toTrans;
                            obj.PAGE = "ACCOUNTS TRANSFER";

                            const logdata = accountspagelog.createTransfer(obj, req);
                            if (logdata.message && logdata.message !== null) {
                              notificationlog.savelog(logdata, res);
                            }
                            res.io.sockets.emit("newledgertrans", Trans);
                            res.io.sockets.emit("newledgertrans", toTrans);
                            
                            res.send({success: true, message: "Transaction successfully saved!", data: Trans});
                            return;
                          }
                          AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                          AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                            {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                          AccounttransModel.findByIdAndRemove(toTrans._id, (errrem) => { });
                          return res.send({success: false, message: "Oops something happened please try again later!."});
                        });
                      } else {
                        AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                        AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                          {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                      }
                    });
                  } else {
                    AccountledgerModel.findByIdAndUpdate(req.body.fromledger.ledger_id,
                      {$inc: {current_balance: parseFloat(req.body.fromledger.transaction_amount)}});
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                });
              } else {
                AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                return res.send({success: false, message: "Oops something happened please try again later!."});
              }
            });
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Ledger not found"});
      }
    });
  }
});

router.post("/updateTransfer", (req, res) => {
  if (req.body.fromledger && req.body.toledger && req.body.fromledger._id && req.body.toledger._id && req.body.fromledger._id !== "" &&
            req.body.toledger._id !== "") {
    if (typeof req.body.fromledger.ledger_id === "undefined" || req.body.fromledger.ledger_id === "") {
      return res.send({success: false, message: "Please select the ledger from which the amount is going to transfer"});
    }

    if (typeof req.body.toledger.ledger_id === "undefined" || req.body.fromledger.toledger === "") {
      return res.send({success: false, message: "Please select the ledger to which the amount is going to receive"});
    }
    async.parallel([
      function (callback) { // Update Transfer from details
        const query = AccounttransModel.findOne({_id: req.body.fromledger._id});
        query.exec((err, Trans) => {
          if (err) {
            callback(err);
          } else if (Trans && Trans._id && Trans._id !== "") {
            const previoustrans = JSON.parse(JSON.stringify(Trans));
            
            Trans = commonfunction.beforeSavetransfer(Trans, req);
            if (typeof req.body.fromledger.transaction_date !== "undefined" && req.body.fromledger.transaction_date !== null &&
            req.body.fromledger.transaction_date !== "") {
              Trans.transaction_date = req.body.fromledger.transaction_date;
            }
            if (typeof req.body.fromledger.transaction_amount !== "undefined" && req.body.fromledger.transaction_amount !== null &&
            req.body.fromledger.transaction_amount !== "") {
              Trans.transaction_amount = req.body.fromledger.transaction_amount;
            }
            if (typeof req.body.fromledger.memo !== "undefined" && req.body.fromledger.memo !== null && req.body.fromledger.memo !== "") {
              Trans.memo = req.body.fromledger.memo;
            }
            if (typeof req.body.fromledger.cheque_no !== "undefined" && req.body.fromledger.cheque_no !== null &&
            req.body.fromledger.cheque_no !== "") {
              Trans.cheque_no = req.body.fromledger.cheque_no;
            }
            if (typeof req.body.fromledger.ledger_id !== "undefined" && req.body.fromledger.ledger_id !== null &&
            req.body.fromledger.ledger_id !== "") {
              Trans.ledger_id = req.body.fromledger.ledger_id;
            }
            if (typeof req.body.fromledger.ledger_name !== "undefined" && req.body.fromledger.ledger_name !== null &&
            req.body.fromledger.ledger_name !== "") {
              Trans.ledger_name = req.body.fromledger.ledger_name;
            }
            Trans.save((errs, Transdt) => {
              if (errs || !Transdt) {
                callback(errs);
              }
              const trdetails = {};
              trdetails.newtrans = Transdt;
              trdetails.oldtrans = previoustrans;
              res.io.sockets.emit("updateledgertrans", trdetails);
              callback(null, Transdt);
            });
          } else {
            callback(null, "");
          }
        });
      },
      function (callback) { // Update Transfer To details
        const query = AccounttransModel.findOne({_id: req.body.toledger._id});
        query.exec((err, Trans) => {
          if (err) {
            callback(err);
          } else if (Trans && Trans._id && Trans._id !== "") {
            const previoustrans = JSON.parse(JSON.stringify(Trans));
            
            Trans = commonfunction.beforeSavetransfer(Trans, req);
            if (typeof req.body.toledger.transaction_date !== "undefined" && req.body.toledger.transaction_date !== null &&
            req.body.toledger.transaction_date !== "") {
              Trans.transaction_date = req.body.toledger.transaction_date;
            }
            if (typeof req.body.toledger.transaction_amount !== "undefined" && req.body.toledger.transaction_amount !== null &&
            req.body.toledger.transaction_amount !== "") {
              Trans.transaction_amount = req.body.toledger.transaction_amount;
            }
            if (typeof req.body.toledger.memo !== "undefined" && req.body.toledger.memo !== null && req.body.toledger.memo !== "") {
              Trans.memo = req.body.toledger.memo;
            }
            if (typeof req.body.toledger.cheque_no !== "undefined" && req.body.toledger.cheque_no !== null && req.body.toledger.cheque_no !== "") {
              Trans.cheque_no = req.body.toledger.cheque_no;
            }
            if (typeof req.body.toledger.ledger_id !== "undefined" && req.body.toledger.ledger_id !== null && req.body.toledger.ledger_id !== "") {
              Trans.ledger_id = req.body.toledger.ledger_id;
            }
            if (typeof req.body.toledger.ledger_name !== "undefined" && req.body.toledger.ledger_name !== null &&
            req.body.toledger.ledger_name !== "") {
              Trans.ledger_name = req.body.toledger.ledger_name;
            }
            Trans.save((errs, Transdt) => {
              if (errs || !Transdt) {
                callback(errs);
              }
              const trdetails = {};
              trdetails.newtrans = Transdt;
              trdetails.oldtrans = previoustrans;
              res.io.sockets.emit("updateledgertrans", trdetails);
              callback(null, Transdt);
            });
          } else {
            callback(null, "");
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (results === null || results[0] === null || results[1] === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }

      const filterData = results[0] || [];

      const obj = {};
      obj.data = {};
      obj.data.from = results[0];
      obj.data.to = results[1];
      obj.PAGE = "ACCOUNTS TRANSFER";
      const logdata = accountspagelog.updateTransfer(obj, req);
      if (logdata.message && logdata.message !== null) {
        notificationlog.savelog(logdata, res);
      }

      return res.send({success: true, message: "Transaction successfully saved!", data: filterData});
    });
  }
});

router.post("/deleteTransaction", (req, res) => {
  if (req.body._id && req.body._id !== "") {
    AccounttransModel.findOne({_id: req.body._id}, (errs, transdata) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (transdata && transdata !== null && transdata._id) {
        if (!transdata.bills || transdata.bills === null || transdata.length === 0) {
          transdata = commonfunction.beforeSavelargedata(transdata, req);
          transdata.is_deleted = true;

          transdata.save((err, Trans) => {
            if (err) {
              res.status(499).send({message: errorhelper.getErrorMessage(err)});
            } else if (Trans && Trans !== null && Trans._id) {
              let balance = Trans.total;
              if (Trans.transaction_type === "CREDIT") {
                balance *= -1;
              }

              AccountledgerModel.findByIdAndUpdate(Trans.ledger_id, {$inc: {current_balance: balance}, updated: new Date()}, (lederr, accled) => {
                if (lederr) {
                  AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false});
                  res.status(499).send({message: errorhelper.getErrorMessage(lederr)});
                  return;
                } else if (accled && accled !== null && accled._id) {
                  const obj = {};
                  obj.data = Trans;
                  obj.PAGE = "ACCOUNTS TRANSACTION";

                  const logdata = accountspagelog.deleteTrans(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }
                  
                  res.io.sockets.emit("deletetrans", Trans);
                      
                  res.send({success: true, message: "Transaction successfully deleted!", data: Trans});
                  return;
                }
                return res.send({success: false, message: "Oops something happened please try again later!."});
              });
            } else {
              return res.send({success: false, message: "Oops something happened please try again later!."});
            }
          });
        } else {
          return res.send({success: false, message: "You cannot delete the invoice transaction not found"});
        }
      } else {
        return res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

router.post("/deleteTransfer", (req, res) => {
  if (req.body._id && req.body._id !== "" && req.body.reference_no && req.body.reference_no !== "") {
    AccounttransModel.find({is_transfer: true, reference_no: req.body.reference_no}, (err, Transactions) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      async.mapSeries(Transactions, (trans, callback) => {
        trans = commonfunction.beforeSavelargedata(trans, req);
        trans.is_deleted = true;

        trans.save((errs, data) => {
          if (errs || !data) {
            trans.stat = "failed";
            return callback(errs, trans);
          } else if (data && data !== null && data._id) {
            let balance = data.total;
            if (data.transaction_type === "CREDIT") {
              balance *= -1;
            }

            AccountledgerModel.findByIdAndUpdate(data.ledger_id, {$inc: {current_balance: balance}, updated: new Date()}, (lederr, accled) => {
              if (lederr || !accled) {
                data.stat = "partial";
                AccounttransModel.findByIdAndUpdate(data._id, {is_deleted: false}, (trerr) => {});
                return callback(errs, data);
              }
              data.stat = "success";
              return callback(null, data);
            });
          }
        });
      }, (errs, results) => {
        if (errs) {
          results.forEach((ledger) => {
            if (ledger.stat === "partial") {
              AccounttransModel.findByIdAndUpdate(ledger._id, {is_deleted: false});
            } else if (ledger.stat === "success") {
              let balance = ledger.total;
              if (ledger.transaction_type === "DEBIT") {
                balance *= -1;
              }
              AccounttransModel.findByIdAndUpdate(ledger._id, {is_deleted: false});
              AccountledgerModel.findByIdAndUpdate(ledger.ledger_id, {$inc: {current_balance: balance}, updated: new Date()});
            }
          });
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        }

        if (results === null || results[0] === null || results[1] === null) {
          return res.send({success: false, message: "Something went wrong please try again later!."});
        }

        let filterData = [];
        if (results[0] && results[0]._id === req.body._id) {
          res.io.sockets.emit("deletetrans", results[0]);
          filterData = results[0];
        }
        if (results[1] && results[1]._id === req.body._id) {
          res.io.sockets.emit("deletetrans", results[1]);
          filterData = results[1];
        }

        return res.send({success: true, message: "Transaction successfully deleted!", data: filterData});
      });
    });
  }
});

router.post("/deleteInvoicetrans", (req, res) => {
  if (req.body._id && req.body._id !== "") {
    BillModel.findOne({_id: req.body._id}).populate("division_id", "_id name").exec((errs, trans) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (trans && trans !== null && trans._id) {
        if (trans.payment_status && trans.payment_status === "PENDING" && trans.type && trans.type === "INVOICE" &&
                        trans.job_id && trans.job_id !== "" && trans.ledger_id && trans.ledger_id !== "") {
          const jobdata = {};
          jobdata.billing_status = false;
        } else {
          res.send({success: false, message: "Payment received for this invoice please delete the transaction before delete this invoice!"});
        }
      } else {
        return res.send({success: false, message: "Oops something happened please try again later!."});
      }
    });
  }
});

function deleteOpeningbalance(Trans, callback){
  CustomeropeningbalModel.findOne({_id: Trans.balance_id}, (accerr, accdata) => {
    if(accerr){
      return callback(errorhelper.getErrorMessage(accerr));
    } else if (accdata && accdata !== null && accdata._id) {
      accdata.total_allocated = parseFloat(accdata.total_allocated) - parseFloat(Trans.amount_allocated);
      accdata.pending_balance = parseFloat(accdata.pending_balance) + parseFloat(Trans.amount_allocated);

      accdata.save((baerr, baTrans) => {
        if (baerr) {
          return callback(errorhelper.getErrorMessage(baerr));
        } else if (baTrans && baTrans !== null && baTrans._id) {
          return callback(null, baTrans);
        } else {
          return callback("Oops something happened please try again later!.");
        }
      });
    } else {
      return callback("Customer opening balance details not found.");
    }
  });
};

function deletePrevousowebalance(Trans, callback){
  CustomeropeningbalModel.findOne({customer_id: Trans.payee_id}, (accerr, accdata) => {
    if(accerr){
      return callback(errorhelper.getErrorMessage(accerr));
    } else if (accdata && accdata !== null && accdata._id) {
        accdata.total_allocated = parseFloat(accdata.total_allocated) - parseFloat(Trans.previous_owe);
        accdata.pending_balance = parseFloat(accdata.pending_balance) - parseFloat(Trans.previous_owe);
        accdata.save((baerr, baTrans) => {
          if (baerr) {
            return callback(errorhelper.getErrorMessage(baerr));
          } else if (baTrans && baTrans !== null && baTrans._id) {
            return callback(null, baTrans);
          } else {
            return callback("Oops something happened please try again later!.");
          }
        });
    } else {
      return callback("Customer opening balance details not found.");
    }
  });
};

router.post("/deletePayment", (req, res) => {
  if (req.body._id && req.body._id !== null && req.body._id !== "") {
    AccounttransModel.findOne({_id: req.body._id}, (errs, transdata) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (transdata && transdata !== null && transdata._id) {
        transdata = commonfunction.beforeSavelargedata(transdata, req);
        transdata.is_deleted = true;

        transdata.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {
            
              if (Trans.customer_openingbalance && Trans.customer_openingbalance !== null && Trans.customer_openingbalance.balance_id && 
                      Trans.customer_openingbalance.amount_allocated && Trans.customer_openingbalance.amount_allocated !== null && 
                      parseFloat(Trans.customer_openingbalance.amount_allocated) > 0) {
                deleteOpeningbalance(Trans.customer_openingbalance, function(coerr, coobj){
                  if (coerr) {
                    AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                    return res.send({success: false, message: coerr});
                  } else if (coobj && coobj !== null && coobj._id) {
                    async.mapSeries(Trans.bills, (trans, callback) => {
                      BillModel.findOne({_id: trans.bill_id}, (berrs, bills) => {
                        if (berrs || !bills) {
                          AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                          return callback(true, "");
                        } else if (bills && bills !== null && bills._id) {
                          const oldBill = bills;
                          bills = commonfunction.beforeSave(bills, req);
                          bills.paid = parseFloat(bills.paid) - parseFloat(trans.amount_allocated);
                          bills.payment_status = "PARTIAL";

                          bills.save((berr, billupdate) => {
                            if (berr || !billupdate) {
                              return callback(true, "");
                            } else {
                              return callback(null, oldBill);
                            }
                          });
                        }
                      });
                    }, (errd, results) => {
                      if (errd) {
                        results.forEach((billdetails) => {
                          if (billdetails !== null && billdetails._id) {
                            BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)}, 
                            {upsert: true}, (bberr) => {});
                          }
                        });
                        AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                      } else {
                        const obj = {};
                        obj.data = Trans;
                        obj.PAGE = "ACCOUNTS TRANSACTION";
                        const logdata = accountspagelog.deleteTrans(obj, req);
                        if (logdata.message && logdata.message !== null) {
                          notificationlog.savelog(logdata, res);
                        }
                        res.io.sockets.emit("deletetrans", Trans);
                        return res.send({success: true, message: "Payment deleted successfully!", data: Trans});
                      }
                    });
                  } else {
                    AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                });
                
              } else if (Trans.previous_owe && Trans.previous_owe !== null && parseFloat(Trans.previous_owe) > 0) {
                deletePrevousowebalance(Trans, function(coerr, coobj){
                  if (coerr) {
                    AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                    return res.send({success: false, message: coerr});
                  } else if (coobj && coobj !== null && coobj._id) {
                    async.mapSeries(Trans.bills, (trans, callback) => {
                      BillModel.findOne({_id: trans.bill_id}, (berrs, bills) => {
                        if (berrs || !bills) {
                          AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                          return callback(true, "");
                        } else if (bills && bills !== null && bills._id) {
                          const oldBill = bills;
                          bills = commonfunction.beforeSave(bills, req);
                          bills.paid = parseFloat(bills.paid) - parseFloat(trans.amount_allocated);
                          bills.payment_status = "PARTIAL";

                          bills.save((berr, billupdate) => {
                            if (berr || !billupdate) {
                              return callback(true, "");
                            } else {
                              return callback(null, oldBill);
                            }
                          });
                        }
                      });
                    }, (errd, results) => {
                      if (errd) {
                        results.forEach((billdetails) => {
                          if (billdetails !== null && billdetails._id) {
                            BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)}, 
                            {upsert: true}, (bberr) => {});
                          }
                        });
                        AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                      } else {
                        const obj = {};
                        obj.data = Trans;
                        obj.PAGE = "ACCOUNTS TRANSACTION";
                        const logdata = accountspagelog.deleteTrans(obj, req);
                        if (logdata.message && logdata.message !== null) {
                          notificationlog.savelog(logdata, res);
                        }
                        res.io.sockets.emit("deletetrans", Trans);
                        return res.send({success: true, message: "Payment deleted successfully!", data: Trans});
                      }
                    });
                  } else {
                    AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                });
              } else {
                async.mapSeries(Trans.bills, (trans, callback) => {
                  BillModel.findOne({_id: trans.bill_id}, (berrs, bills) => {
                    if (berrs || !bills) {
                      AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                      return callback(true, "");
                    } else if (bills && bills !== null && bills._id) {
                      const oldBill = bills;
                      bills = commonfunction.beforeSave(bills, req);
                      bills.paid = parseFloat(bills.paid) - parseFloat(trans.amount_allocated);
                      bills.payment_status = "PARTIAL";

                      bills.save((berr, billupdate) => {
                        if (berr || !billupdate) {
                          return callback(true, "");
                        } else {
                          return callback(null, oldBill);
                        }
                      });
                    }
                  });
                }, (errd, results) => {
                  if (errd) {
                    results.forEach((billdetails) => {
                      if (billdetails !== null && billdetails._id) {
                        BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)}, 
                        {upsert: true}, (bberr) => {});
                      }
                    });
                    AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  } else {
                    const obj = {};
                    obj.data = Trans;
                    obj.PAGE = "ACCOUNTS TRANSACTION";
                    const logdata = accountspagelog.deleteTrans(obj, req);
                    if (logdata.message && logdata.message !== null) {
                      notificationlog.savelog(logdata, res);
                    }
                    res.io.sockets.emit("deletetrans", Trans);
                    return res.send({success: true, message: "Payment deleted successfully!", data: Trans});
                  }
                });
              }
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

router.post("/deleteDebitnote", (req, res) => {
  if (req.body._id && req.body._id !== null && req.body._id !== "") {
    AccounttransModel.findOne({_id: req.body._id}, (errs, transdata) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (transdata && transdata !== null && transdata._id) {
        transdata = commonfunction.beforeSavelargedata(transdata, req);
        transdata.is_deleted = true;

        transdata.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {            
            async.mapSeries(Trans.bills, (trans, callback) => {
              BillModel.findOne({_id: trans.bill_id}, (berrs, bills) => {
                if (berrs || !bills) {
                  AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                  return callback(true, "");
                } else if (bills && bills !== null && bills._id) {
                  const oldBill = bills;
                  bills = commonfunction.beforeSave(bills, req);
                  bills.paid = parseFloat(bills.paid) - parseFloat(trans.amount_allocated);
                  bills.payment_status = "PARTIAL";

                  bills.save((berr, billupdate) => {
                    if (berr || !billupdate) {
                      return callback(true, "");
                    } else {
                      return callback(null, oldBill);
                    }
                  });
                }
              });
            }, (errd, results) => {
              if (errd) {
                results.forEach((billdetails) => {
                  if (billdetails !== null && billdetails._id) {
                    BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)}, 
                    {upsert: true}, (bberr) => {});
                  }
                });
                AccounttransModel.findByIdAndUpdate(Trans._id, {is_deleted: false}, (errrem) => { });
                return res.send({success: false, message: "Oops something happened please try again later!."});
              } else {
                const obj = {};
                obj.data = Trans;
                obj.PAGE = "ACCOUNTS DEBIT NOTE";
                const logdata = accountspagelog.deleteDebitnote(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }
                res.io.sockets.emit("deletetrans", Trans);
                return res.send({success: true, message: "Debit note deleted successfully!", data: Trans});
              }
            });
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

router.post("/deleteCreditnote", (req, res) => {
  if (req.body._id && req.body._id !== null && req.body._id !== "") {
    AccounttransModel.findOne({_id: req.body._id}, (errs, transdata) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (transdata && transdata !== null && transdata._id) {
        transdata = commonfunction.beforeSavelargedata(transdata, req);
        transdata.is_deleted = true;

        transdata.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {             
            const obj = {};
            obj.data = Trans;
            obj.PAGE = "ACCOUNTS CREDIT NOTE";
            const logdata = accountspagelog.deleteCreditnote(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            res.io.sockets.emit("deletetrans", Trans);
            return res.send({success: true, message: "Credit note deleted successfully!", data: Trans});
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

function updateOpeningbalance(Trans, callback){
  CustomeropeningbalModel.findOne({_id: Trans.balance_id}, (accerr, accdata) => {
    if(accerr){
      return callback(errorhelper.getErrorMessage(accerr));
    } else if (accdata && accdata !== null && accdata._id) {
      if (accdata.due_status === "Closed") {
        return callback("Customer opening balance is closed already");
      } else {
        if (parseFloat(Trans.amount_allocated) > parseFloat(accdata.pending_balance)) {
          return callback("Customer opening balance allocated amount exceeds the pending amount");
        } else {
          accdata.total_allocated = parseFloat(accdata.total_allocated) + parseFloat(Trans.amount_allocated);
          accdata.pending_balance = parseFloat(accdata.pending_balance) - parseFloat(Trans.amount_allocated);
          
          accdata.save((baerr, baTrans) => {
            if (baerr) {
              return callback(errorhelper.getErrorMessage(baerr));
            } else if (baTrans && baTrans !== null && baTrans._id) {
              return callback(null, baTrans);
            } else {
              return callback("Oops something happened please try again later!.");
            }
          });
        }
      }
    } else {
      return callback("Customer opening balance details not found.");
    }
  });
};

function updatePrevousowebalance(Trans, callback){
  CustomeropeningbalModel.findOne({customer_id: Trans.payee_id}, (accerr, accdata) => {
    if(accerr){
      return callback(errorhelper.getErrorMessage(accerr));
    } else if (accdata && accdata !== null && accdata._id) {
      if (accdata.due_status === "Closed") {
        return callback("Customer previous owe is closed already");
      } else {
        if (parseFloat(Trans.previous_owe) > (-1 * parseFloat(accdata.pending_balance))) {
          return callback("Customer previous owe amount exceeds the pending amount");
        } else {
          accdata.total_allocated = parseFloat(accdata.total_allocated) + parseFloat(Trans.previous_owe);
          accdata.pending_balance = parseFloat(accdata.pending_balance) + parseFloat(Trans.previous_owe);
          accdata.save((baerr, baTrans) => {
            if (baerr) {
              return callback(errorhelper.getErrorMessage(baerr));
            } else if (baTrans && baTrans !== null && baTrans._id) {
              return callback(null, baTrans);
            } else {
              return callback("Oops something happened please try again later!.");
            }
          });
        }
      }
    } else {
      return callback("Customer opening balance details not found.");
    }
  });
};

router.post("/savePayment", (req, res) => {
  if (req.body.payment && req.body.payment.transaction_amount && req.body.payment.transaction_amount !== null &&
    req.body.payment.transaction_amount !== "" && parseFloat(req.body.payment.transaction_amount) > 0) {
    if (req.body.payment.balance === null || req.body.payment.balance === "" || parseFloat(req.body.payment.balance) > 0) {
      return res.send({success: false, message: "Payment amount should be allocated to bills without any pendings"});
    }
    if (parseFloat(req.body.payment.balance) < 0) {
      return res.send({success: false, message: "Total allocated amount should be equal to the payment amount"});
    }
    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to complete the payment"});
    }
    if(!req.body.payment.bills && !req.body.payment.customer_openingbalance){
      return res.send({success: false, message: "There is no payment allocation found to save this payment"});
    }
    if ((req.body.payment.customer_openingbalance && (req.body.payment.customer_openingbalance === "" || 
        req.body.payment.customer_openingbalance === null || !req.body.payment.customer_openingbalance.balance_id)) && 
        (req.body.payment.bills && (req.body.payment.bills === "" || req.body.payment.bills === null || req.body.payment.bills.length === 0))) {
      return res.send({success: false, message: "There is no payment allocation found to save this payment"});
    }

    AccountledgerModel.findOne({_id: req.body.payment.ledger_id}, (accerr, accdata) => {
      if (accerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(accerr)});
      } else if (accdata && accdata !== null && accdata._id) {
        //                var ledgerbalance = parseFloat(req.body.payment.transaction_amount) + parseFloat(accdata.current_balance);
        let accountTrans = new AccounttransModel({
          division_id: req.body.payment.division_id,
          branch_name: req.body.payment.branch_name,
          type: req.body.payment.type,
          category_name: req.body.payment.category_name,
          transaction_type: req.body.payment.transaction_type,
          transaction_date: req.body.payment.transaction_date,
          transaction_amount: req.body.payment.transaction_amount,
          ledger_id: req.body.payment.ledger_id,
          ledger_name: req.body.payment.ledger_name,
          payee_id: req.body.payment.payee_id,
          payee_name: req.body.payment.payee_name,
          payee_mobileno: req.body.payment.payee_mobileno,
          bills: req.body.payment.bills,
          memo: req.body.payment.memo,
          cheque_no: req.body.payment.cheque_no,
          balance: req.body.payment.balance,
          //                    ledger_balance: ledgerbalance
        });
        if(req.body.payment.previous_owe){
          accountTrans.previous_owe = req.body.payment.previous_owe;
        }
        if(req.body.payment.customer_openingbalance){
          accountTrans.customer_openingbalance = req.body.payment.customer_openingbalance;
        }
        // schema before save actions
        accountTrans = commonfunction.beforeSavelargedata(accountTrans, req);

        accountTrans.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {
            if ((Trans.bills && Trans.bills !== null && Trans.bills !== "" && Trans.bills.length > 0) || 
                    (Trans.customer_openingbalance && Trans.customer_openingbalance !== null && Trans.customer_openingbalance.balance_id)) {
              if (Trans.customer_openingbalance && Trans.customer_openingbalance !== null && Trans.customer_openingbalance.balance_id && 
                      Trans.customer_openingbalance.amount_allocated && Trans.customer_openingbalance.amount_allocated !== null && 
                      parseFloat(Trans.customer_openingbalance.amount_allocated) > 0) {
                updateOpeningbalance(Trans.customer_openingbalance, function(coerr, coobj){
                  if (coerr) {
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: coerr});
                  } else if (coobj && coobj !== null && coobj._id) {
                    async.mapSeries(Trans.bills, (trans, callback) => {
                      BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                        if (errs || !bills) {
                          AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                          return callback(true, "");
                        } else if (bills && bills !== null && bills._id) {
                          bills = commonfunction.beforeSave(bills, req);
                          bills.paid = parseFloat(bills.paid) + parseFloat(trans.amount_allocated);

                          bills.save((berr, billupdate) => {
                            if (berr || !billupdate) {
                              return callback(true, "");
                            }
                            return callback(null, bills);
                          });
                        }
                      });
                    }, (errd, results) => {
                      if (errd) {
                        results.forEach((billdetails) => {
                          if (billdetails !== null && billdetails._id) {
                            BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                                {upsert: true}, (bberr) => {});
                          }
                        });
                        AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                      }
                      const obj = {};
                      obj.data = Trans;
                      obj.PAGE = "ACCOUNTS PAYMENT";

                      const logdata = accountspagelog.createPayment(obj, req);
                      if (logdata.message && logdata.message !== null) {
                        notificationlog.savelog(logdata, res);
                      }
                      
                      res.io.sockets.emit("newcreditdebittrans", Trans);
                      return res.send({success: true, message: "Payment Received Successfully!", data: Trans});
                    });
                  } else {
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                });
              } else if (Trans.previous_owe && Trans.previous_owe !== null && parseFloat(Trans.previous_owe) > 0) {
                updatePrevousowebalance(Trans, function(coerr, coobj){
                  if (coerr) {
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: coerr});
                  } else if (coobj && coobj !== null && coobj._id) {
                    async.mapSeries(Trans.bills, (trans, callback) => {
                      BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                        if (errs || !bills) {
                          AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                          return callback(true, "");
                        } else if (bills && bills !== null && bills._id) {
                          bills = commonfunction.beforeSave(bills, req);
                          bills.paid = parseFloat(bills.paid) + parseFloat(trans.amount_allocated);

                          bills.save((berr, billupdate) => {
                            if (berr || !billupdate) {
                              return callback(true, "");
                            }
                            return callback(null, bills);
                          });
                        }
                      });
                    }, (errd, results) => {
                      if (errd) {
                        results.forEach((billdetails) => {
                          if (billdetails !== null && billdetails._id) {
                            BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                                {upsert: true}, (bberr) => {});
                          }
                        });
                        AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                      }
                      const obj = {};
                      obj.data = Trans;
                      obj.PAGE = "ACCOUNTS PAYMENT";

                      const logdata = accountspagelog.createPayment(obj, req);
                      if (logdata.message && logdata.message !== null) {
                        notificationlog.savelog(logdata, res);
                      }
                      
                      res.io.sockets.emit("newcreditdebittrans", Trans);
                      return res.send({success: true, message: "Payment Received Successfully!", data: Trans});
                    });
                  } else {
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                });
              } else {
                async.mapSeries(Trans.bills, (trans, callback) => {
                  BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                    if (errs || !bills) {
                      AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                      return callback(true, "");
                    } else if (bills && bills !== null && bills._id) {
                      bills = commonfunction.beforeSave(bills, req);
                      bills.paid = parseFloat(bills.paid) + parseFloat(trans.amount_allocated);

                      bills.save((berr, billupdate) => {
                        if (berr || !billupdate) {
                          return callback(true, "");
                        }
                        return callback(null, bills);
                      });
                    }
                  });
                }, (errd, results) => {
                  if (errd) {
                    results.forEach((billdetails) => {
                      if (billdetails !== null && billdetails._id) {
                        BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                          {upsert: true}, (bberr) => {});
                      }
                    });
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return res.send({success: false, message: "Oops something happened please try again later!."});
                  }
                  const obj = {};
                  obj.data = Trans;
                  obj.PAGE = "ACCOUNTS PAYMENT";

                  const logdata = accountspagelog.createPayment(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }
                  
                  res.io.sockets.emit("newcreditdebittrans", Trans);
                  return res.send({success: true, message: "Payment Received Successfully!", data: Trans});
                });
              }
            } else {
              AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
              return res.send({success: false, message: "Oops something happened please try again later!."});
            }
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Ledger not found"});
      }
    });
  }
});

router.post("/saveDebit", (req, res) => {
  if (req.body.payment && req.body.payment.transaction_amount && req.body.payment.transaction_amount !== null &&
    req.body.payment.transaction_amount !== "" && parseFloat(req.body.payment.transaction_amount) > 0) {
    if (req.body.payment.balance === null || req.body.payment.balance === "" || parseFloat(req.body.payment.balance) > 0) {
      return res.send({success: false, message: "Debit amount should be allocated to bills without any pendings"});
    }
    if (parseFloat(req.body.payment.balance) < 0) {
      return res.send({success: false, message: "Total allocated amount should be equal to the debit amount"});
    }
    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to complete this debit entry"});
    }
    if(!req.body.payment.bills){
      return res.send({success: false, message: "There is no allocation found to save this debit entry"});
    }
    if (req.body.payment.bills && (req.body.payment.bills === "" || req.body.payment.bills === null || req.body.payment.bills.length === 0)) {
      return res.send({success: false, message: "There is no allocation found to save this debit entry"});
    }

    DivisionaccountModel.findOne({division_id: req.body.payment.division_id}, "division_id debit_note").exec((brancherr, Branchaccount) => {
      if (brancherr) {
        res.status(499).send({message: errorhelper.getErrorMessage(brancherr)});
      } else if (Branchaccount && Branchaccount !== null && Branchaccount._id && Branchaccount._id !== "" && Branchaccount.debit_note &&
      Branchaccount.debit_note.prefix && Branchaccount.debit_note.serial_no && Branchaccount.debit_note.prefix !== "" &&
      Branchaccount.debit_note.serial_no !== "") {
        const debit_no = `${Branchaccount.debit_note.prefix}${Branchaccount.debit_note.serial_no}`;
        let accountTrans = new AccounttransModel({
          division_id: req.body.payment.division_id,
          serial_no: debit_no,
          branch_name: req.body.payment.branch_name,
          type: "DEBIT NOTE",
          category_name: req.body.payment.category_name,
          transaction_type: req.body.payment.transaction_type,
          transaction_date: new Date(),
          transaction_amount: req.body.payment.transaction_amount,
          ledger_id: req.body.payment.ledger_id,
          ledger_name: req.body.payment.ledger_name,
          payee_id: req.body.payment.payee_id,
          payee_name: req.body.payment.payee_name,
          payee_mobileno: req.body.payment.payee_mobileno,
          bills: req.body.payment.bills,
          memo: req.body.payment.memo,
          balance: req.body.payment.balance,
        });
        // schema before save actions
        accountTrans = commonfunction.beforeSavelargedata(accountTrans, req);

        accountTrans.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {
            const brquery = {division_id: Branchaccount.division_id};
            if (Trans.bills && Trans.bills !== null && Trans.bills !== "" && Trans.bills.length > 0) {              
              async.mapSeries(Trans.bills, (trans, callback) => {
                BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                  if (errs || !bills) {
                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"debit_note.serial_no": -1}}, {upsert: true});
                    AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                    return callback(true, "");
                  } else if (bills && bills !== null && bills._id) {
                    bills = commonfunction.beforeSave(bills, req);
                    bills.paid = parseFloat(bills.paid) + parseFloat(trans.amount_allocated);

                    bills.save((berr, billupdate) => {
                      if (berr || !billupdate) {
                        return callback(true, "");
                      }
                      return callback(null, bills);
                    });
                  }
                });
              }, (errd, results) => {
                if (errd) {
                  results.forEach((billdetails) => {
                    if (billdetails !== null && billdetails._id) {
                      BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                        {upsert: true}, (bberr) => {});
                    }
                  });
                  AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
                  return res.send({success: false, message: "Oops something happened please try again later!."});
                } else {
                  DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"debit_note.serial_no": 1}}, (brerr) => { });
                  const obj = {};
                  obj.data = Trans;
                  obj.PAGE = "ACCOUNTS DEBIT NOTE";

                  const logdata = accountspagelog.createDebit(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }
                  const trdetails = {};
                  trdetails._id = Trans._id;
                  trdetails.transaction_amount = Trans.transaction_amount;
                  trdetails.ledger_id = Trans.ledger_id;
            
                  res.io.sockets.emit("newcreditdebittrans", trdetails);            
                  return res.send({success: true, message: "Debit note saved successfully!", data: Trans});
                }
              });
            } else {
              DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"debit_note.serial_no": -1}}, {upsert: true});
              AccounttransModel.findByIdAndRemove(Trans._id, (errrem) => { });
              return res.send({success: false, message: "Oops something happened please try again later!."});
            }
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Prefix for invoice not found"});
      }
    });
  }
});

router.post("/saveCredit", (req, res) => {
  if (req.body.payment && req.body.payment.transaction_amount && req.body.payment.transaction_amount !== null &&
    req.body.payment.transaction_amount !== "" && parseFloat(req.body.payment.transaction_amount) > 0) {

    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to complete this credit entry"});
    }
    
    if (!req.body.payment.user_type || (req.body.payment.user_type && (req.body.payment.user_type === "" || req.body.payment.user_type === null))) {
      return res.send({success: false, message: "Please select customer to complete this credit entry"});
    }
    
    DivisionaccountModel.findOne({division_id: req.body.payment.division_id}, "division_id credit_note").exec((brancherr, Branchaccount) => {
      if (brancherr) {
        res.status(499).send({message: errorhelper.getErrorMessage(brancherr)});
      } else if (Branchaccount && Branchaccount !== null && Branchaccount._id && Branchaccount._id !== "" && Branchaccount.credit_note &&
        Branchaccount.credit_note.prefix && Branchaccount.credit_note.serial_no && Branchaccount.credit_note.prefix !== "" &&
        Branchaccount.credit_note.serial_no !== "") {
    
        const credit_no = `${Branchaccount.credit_note.prefix}${Branchaccount.credit_note.serial_no}`;
        let accountTrans = new AccounttransModel({
          division_id: req.body.payment.division_id,
          serial_no: credit_no,
          branch_name: req.body.payment.branch_name,
          type: "CREDIT NOTE",
          category_name: req.body.payment.category_name,
          transaction_type: req.body.payment.transaction_type,
          transaction_date: new Date(),
          transaction_amount: req.body.payment.transaction_amount,
          ledger_id: req.body.payment.ledger_id,
          ledger_name: req.body.payment.ledger_name,
          payee_id: req.body.payment.payee_id,
          payee_name: req.body.payment.payee_name,
          payee_mobileno: req.body.payment.payee_mobileno,
          user_type: req.body.payment.user_type,
          invoice_nos: req.body.payment.invoice_nos,
          memo: req.body.payment.memo,
        });
        // schema before save actions
        accountTrans = commonfunction.beforeSavelargedata(accountTrans, req);

        accountTrans.save((err, Trans) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
          } else if (Trans && Trans !== null && Trans._id) {
            const brquery = {division_id: Branchaccount.division_id};            
               
            DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"credit_note.serial_no": 1}}, (brerr) => { });
            const obj = {};
            obj.data = Trans;
            obj.PAGE = "ACCOUNTS CREDIT NOTE";

            const logdata = accountspagelog.createCredit(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            const trdetails = {};
            trdetails._id = Trans._id;
            trdetails.transaction_amount = Trans.transaction_amount;
            trdetails.ledger_id = Trans.ledger_id;
            
            res.io.sockets.emit("newcreditdebittrans", trdetails);
            return res.send({success: true, message: "Credit note saved successfully!", data: Trans});
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Prefix for invoice not found"});
      }
    });
  }
});

function pendingBilldue(newBilltrans, oldBilltrans, callback) {
  const billTransactions = [];
  const len = oldBilltrans.length;
  let loopexecuted = 0;
  let loopcomplete = 0;
  for (let i = 0; i < len; i += 1) {
    let exist = false;

    for (let j = 0; j < newBilltrans.length; j += 1) {
      if (oldBilltrans[i].bill_id && newBilltrans[j].bill_id && String(oldBilltrans[i].bill_id) === String(newBilltrans[j].bill_id)) {
        exist = true;
        const transdt = {};
        transdt.amount_allocated = newBilltrans[j].amount_allocated;
        transdt.balance_due = newBilltrans[j].balance_due;
        transdt.amount = newBilltrans[j].amount;
        transdt.bill_no = newBilltrans[j].bill_no;
        transdt.bill_id = newBilltrans[j].bill_id;

        if (parseFloat(oldBilltrans[i].amount_allocated) === parseFloat(newBilltrans[j].amount_allocated)) {
          transdt.replaceamount = 0;
          transdt.billstatus = "NOTHING";
          newBilltrans[j].billstatus = "NOTHING";
          billTransactions.push(transdt);
        } else {
          transdt.billstatus = "UPDATE";
          newBilltrans[j].billstatus = "UPDATE";
          transdt.replaceamount = parseFloat(oldBilltrans[i].amount_allocated) - parseFloat(newBilltrans[j].amount_allocated);

          billTransactions.push(transdt);
        }
      }
      if (j === newBilltrans.length - 1) {
        loopexecuted += 1;
      }
    }
    if (i === loopexecuted - 1) {
      if (!exist) {
        const removedbill = {};
        removedbill.amount_allocated = oldBilltrans[i].amount_allocated;
        removedbill.balance_due = oldBilltrans[i].balance_due;
        removedbill.amount = oldBilltrans[i].amount;
        removedbill.bill_no = oldBilltrans[i].bill_no;
        removedbill.bill_id = oldBilltrans[i].bill_id;
        removedbill.replaceamount = parseFloat(oldBilltrans[i].amount_allocated);
        removedbill.billstatus = "REMOVED";

        billTransactions.push(removedbill);
      }
      loopcomplete += 1;
    }
  }
  if (len === loopcomplete) {
    for (let j = 0; j < newBilltrans.length; j += 1) {
      if (!newBilltrans[j].billstatus) {
        const trans = {};
        trans.amount_allocated = newBilltrans[j].amount_allocated;
        trans.balance_due = newBilltrans[j].balance_due;
        trans.amount = newBilltrans[j].amount;
        trans.bill_no = newBilltrans[j].bill_no;
        trans.bill_id = newBilltrans[j].bill_id;
        trans.billstatus = "ADD";
        trans.replaceamount = parseFloat(newBilltrans[j].amount_allocated);

        billTransactions.push(trans);
      }
      if (j === newBilltrans.length - 1) {
        callback(null, billTransactions);
      }
    }
  }
}

function Previousowebalanceupdate(oldtrans, Trans, callback){
  CustomeropeningbalModel.findOne({customer_id: Trans.payee_id}, (accerr, accdata) => {
    if(accerr){
      return callback(errorhelper.getErrorMessage(accerr));
    } else if (accdata && accdata !== null && accdata._id) {
      if (oldtrans.customer_openingbalance && oldtrans.customer_openingbalance !== null && oldtrans.customer_openingbalance.balance_id) {
        let allocateddiff = parseFloat(oldtrans.customer_openingbalance.amount_allocated);
        
        if (Trans.customer_openingbalance && Trans.customer_openingbalance !== null && Trans.customer_openingbalance.balance_id) {
            allocateddiff -= parseFloat(Trans.customer_openingbalance.amount_allocated);
        }
        
        let totalallocated = parseFloat(accdata.total_allocated) - (parseFloat(allocateddiff));
        let pendingbal = parseFloat(accdata.pending_balance) + (parseFloat(allocateddiff));
        accdata.total_allocated = totalallocated;
        accdata.pending_balance = pendingbal;
        
        accdata.save((baerr, baTrans) => {
            if (baerr) {
              return callback(errorhelper.getErrorMessage(baerr));
            } else if (baTrans && baTrans !== null && baTrans._id) {
              return callback(null, baTrans);
            } else {
              return callback("Oops something happened please try again later!.");
            }
        });
      } else if (Trans.customer_openingbalance && Trans.customer_openingbalance !== null && Trans.customer_openingbalance.balance_id) {
        if (accdata.due_status === "Closed") {
          return callback("Customer opening balance is closed already");
        } else {
          if (parseFloat(Trans.amount_allocated) > parseFloat(accdata.pending_balance)) {
            return callback("Customer opening balance allocated amount exceeds the pending amount");
          } else {
            let allocateddiff = parseFloat(Trans.customer_openingbalance.amount_allocated);

            accdata.total_allocated = parseFloat(accdata.total_allocated) + parseFloat(allocateddiff);
            accdata.pending_balance = parseFloat(accdata.pending_balance) - parseFloat(allocateddiff);
            accdata.save((baerr, baTrans) => {
                if (baerr) {
                  return callback(errorhelper.getErrorMessage(baerr));
                } else if (baTrans && baTrans !== null && baTrans._id) {
                  return callback(null, baTrans);
                } else {
                  return callback("Oops something happened please try again later!.");
                }
            });
          }
        }
      } else {
        return callback("Customer opening balance details not found.");
      }
    } else {
      return callback("Customer opening balance details not found.");
    }
  });
};

router.post("/updatePayment", (req, res) => {
  if (req.body.payment && req.body.payment !== null && req.body.payment._id && req.body.payment.transaction_amount &&
    req.body.payment.transaction_amount !== null && req.body.payment.transaction_amount !== "" &&
    parseFloat(req.body.payment.transaction_amount) > 0) {
    if (req.body.payment.balance === null || req.body.payment.balance === "" || parseFloat(req.body.payment.balance) > 0) {
      return res.send({success: false, message: "Payment amount should be allocated to bills without any pendings"});
    }
    if (parseFloat(req.body.payment.balance) < 0) {
      return res.send({success: false, message: "Total allocated amount should be equal to the payment amount"});
    }
    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to complete the payment"});
    }
    if(!req.body.payment.bills && !req.body.payment.customer_openingbalance){
      return res.send({success: false, message: "There is no payment allocation found to save this payment"});
    }
    if ((req.body.payment.customer_openingbalance && (req.body.payment.customer_openingbalance === "" || 
        req.body.payment.customer_openingbalance === null || req.body.payment.customer_openingbalance.balance_id)) && 
        (req.body.payment.bills && (req.body.payment.bills === "" || req.body.payment.bills === null || req.body.payment.bills.length === 0))) {
      return res.send({success: false, message: "There is no payment allocation found to save this payment"});
    }
    
    AccounttransModel.findOne({_id: req.body.payment._id}, (trerr, trdata) => {
      if (trerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(trerr)});
      } else if (trdata && trdata !== null && trdata._id) {
        if ((trdata.bills && trdata.bills !== null && trdata.bills !== "" && trdata.bills.length > 0) || 
            (trdata.customer_openingbalance && trdata.customer_openingbalance !== null && trdata.customer_openingbalance.balance_id)) {
          let oldBills = JSON.parse(JSON.stringify(trdata.bills));
          let oldTrans = JSON.parse(JSON.stringify(trdata));
          
        pendingBilldue(req.body.payment.bills, trdata.bills, (billerrs, billdata) => {
          if (billdata && billdata !== null && billdata.length > 0) {
            async.mapSeries(billdata, (trans, callback) => {
              if (trans.billstatus !== "NOTHING") {
                BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                  if (errs || !bills) {
                    return callback(true, "Invoice allocated in this transaction not found");
                  } else if (bills && bills !== null && bills._id) {
                    const billdt = {};
                    billdt._id = bills._id;
                    billdt.paid = bills.paid;

                    bills = commonfunction.beforeSave(bills, req);
                    bills.paid = parseFloat(bills.paid) - parseFloat(trans.replaceamount);

                    bills.save((ber, billupdate) => {
                      if (ber || !billupdate) {
                        return callback(true, []);
                      }
                      return callback(null, billdt);
                    });
                  }
                });
              } else {
                return callback(null, []);
              }
            }, (lerr, results) => {
              if (lerr) {
                results.forEach((billdetails) => {
                  if (billdetails !== null && billdetails._id) {
                    BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                      {upsert: true}, (bberr) => {});
                  }
                });
                return res.send({success: false, message: "Oops something happened please try again later!."});
              } else {
                  trdata.transaction_amount = req.body.payment.transaction_amount;
                  trdata.ledger_id = req.body.payment.ledger_id;
                  trdata.ledger_name = req.body.payment.ledger_name;
                  trdata.cheque_no = req.body.payment.cheque_no;
                  trdata.memo = req.body.payment.memo;
                  trdata.bills = req.body.payment.bills;
                  if (req.body.payment.customer_openingbalance) {
                    trdata.customer_openingbalance = req.body.payment.customer_openingbalance;
                  }
                  // schema before save actions
                  trdata = commonfunction.beforeSavelargedata(trdata, req);
                  trdata.save((terr, Transdata) => {
                    if (terr) {
                      results.forEach((billdetails) => {
                        if (billdetails !== null && billdetails._id) {
                          BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                            {upsert: true}, (bberr) => {});
                        }
                      });
                      res.status(499).send({message: errorhelper.getErrorMessage(terr)});
                      return;
                    } else if (Transdata && Transdata !== null && Transdata._id) {
                      if ((Transdata.customer_openingbalance && Transdata.customer_openingbalance !== "" && Transdata.customer_openingbalance !== null && 
                              Transdata.customer_openingbalance.balance_id) || 
                        (oldTrans.customer_openingbalance && oldTrans.customer_openingbalance !== "" && oldTrans.customer_openingbalance !== null && 
                              oldTrans.customer_openingbalance.balance_id)) {
                        Previousowebalanceupdate(oldTrans,Transdata, function(coerr, coobj){
                          if (coerr) {
                            results.forEach((billdetails) => {
                              if (billdetails !== null && billdetails._id) {
                                BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                                  {upsert: true}, (bberr) => {});
                              }
                            });
                            AccounttransModel.findOneAndUpdate({_id: oldTrans._id}, oldTrans, (oerr, oData) => {});
                            return res.send({success: false, message: coerr});
                          } else if (coobj && coobj !== null && coobj._id) {
                              const obj = {};
                              obj.data = Transdata;
                              obj.data.prevpayment = oldBills;
                              obj.PAGE = "ACCOUNTS PAYMENT";

                              const logdata = accountspagelog.updatePayment(obj, req);
                              if (logdata.message && logdata.message !== null) {
                                notificationlog.savelog(logdata, res);
                              }
                              const trdetails = {};
                              trdetails.newtrans = Transdata;
                              trdetails.oldtrans = oldTrans;
                              res.io.sockets.emit("updatedebitcredittrans", trdetails);
                              return res.send({success: true, message: "Payment Received Successfully!", data: Transdata});
                          } else {
                            results.forEach((billdetails) => {
                              if (billdetails !== null && billdetails._id) {
                                BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                                  {upsert: true}, (bberr) => {});
                              }
                            });
                            AccounttransModel.findOneAndUpdate({_id: oldTrans._id}, oldTrans, (oerr, oData) => {});
                            return res.send({success: false, message: "Oops something happened please try again later!."});
                          }
                        });
                      } else {
                        const obj = {};
                        obj.data = Transdata;
                        obj.data.prevpayment = oldBills;
                        obj.PAGE = "ACCOUNTS PAYMENT";

                        const logdata = accountspagelog.updatePayment(obj, req);
                        if (logdata.message && logdata.message !== null) {
                          notificationlog.savelog(logdata, res);
                        }

                        return res.send({success: true, message: "Payment Received Successfully!", data: Transdata});
                      }
                    } else {
                        results.forEach((billdetails) => {
                          if (billdetails !== null && billdetails._id) {
                            BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                              {upsert: true}, (bberr) => {});
                          }
                        });
                        return res.send({success: false, message: "Oops something happened please try again later!."});
                    }
                  });
              }
            });
          } else {
            return res.send({success: false, message: "Something went wrong please try again later."});
          }
        });
        } else {
          return res.send({success: false, message: "Payment allocated bill details not found."});
        }
      } else {
        return res.send({success: false, message: "Payment transaction not found"});
      }
    });
  }
});

router.post("/updateDebit", (req, res) => {
  if (req.body.payment && req.body.payment !== null && req.body.payment._id && req.body.payment.transaction_amount &&
    req.body.payment.transaction_amount !== null && req.body.payment.transaction_amount !== "" &&
    parseFloat(req.body.payment.transaction_amount) > 0) {
    if (req.body.payment.balance === null || req.body.payment.balance === "" || parseFloat(req.body.payment.balance) > 0) {
      return res.send({success: false, message: "Debit amount should be allocated to bills without any pendings"});
    }
    if (parseFloat(req.body.payment.balance) < 0) {
      return res.send({success: false, message: "Total allocated amount should be equal to the debit amount"});
    }
    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to complete this debit entry"});
    }
    if(!req.body.payment.bills){
      return res.send({success: false, message: "There is no allocation found to save this debit entry"});
    }
    if (req.body.payment.bills && (req.body.payment.bills === "" || req.body.payment.bills === null || req.body.payment.bills.length === 0)) {
      return res.send({success: false, message: "There is no allocation found to save this debit entry"});
    }
    
    AccounttransModel.findOne({_id: req.body.payment._id}, (trerr, trdata) => {
      if (trerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(trerr)});
      } else if (trdata && trdata !== null && trdata._id) {
        if (trdata.bills && trdata.bills !== null && trdata.bills !== "" && trdata.bills.length > 0) {
            
          let oldBills = JSON.parse(JSON.stringify(trdata.bills));
          let oldTrans = JSON.parse(JSON.stringify(trdata));
          
          pendingBilldue(req.body.payment.bills, trdata.bills, (billerrs, billdata) => {
            if (billdata && billdata !== null && billdata.length > 0) {
              async.mapSeries(billdata, (trans, callback) => {
                if (trans.billstatus !== "NOTHING") {
                  BillModel.findOne({_id: trans.bill_id}, (errs, bills) => {
                    if (errs || !bills) {
                      return callback(true, "Invoice allocated in this transaction not found");
                    } else if (bills && bills !== null && bills._id) {
                      const billdt = {};
                      billdt._id = bills._id;
                      billdt.paid = bills.paid;

                      bills = commonfunction.beforeSave(bills, req);
                      bills.paid = parseFloat(bills.paid) - parseFloat(trans.replaceamount);

                      bills.save((ber, billupdate) => {
                        if (ber || !billupdate) {
                          return callback(true, []);
                        }
                        return callback(null, billdt);
                      });
                    }
                  });
                } else {
                  return callback(null, []);
                }
              }, (lerr, results) => {
                if (lerr) {
                  results.forEach((billdetails) => {
                    if (billdetails !== null && billdetails._id) {
                      BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                        {upsert: true}, (bberr) => {});
                    }
                  });
                  return res.send({success: false, message: "Oops something happened please try again later!."});
                } else {
                  trdata.transaction_amount = req.body.payment.transaction_amount;
                  trdata.ledger_id = req.body.payment.ledger_id;
                  trdata.ledger_name = req.body.payment.ledger_name;
                  trdata.memo = req.body.payment.memo;
                  trdata.bills = req.body.payment.bills;
                    
                  // schema before save actions
                  trdata = commonfunction.beforeSavelargedata(trdata, req);
                    
                  trdata.save((terr, Transdata) => {
                    if (terr) {
                      results.forEach((billdetails) => {
                        if (billdetails !== null && billdetails._id) {
                          BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                            {upsert: true}, (bberr) => {});
                        }
                      });
                      res.status(499).send({message: errorhelper.getErrorMessage(terr)});
                      return;
                    } else if (Transdata && Transdata !== null && Transdata._id) {

                      const obj = {};
                      obj.data = Transdata;
                      obj.data.prevpayment = oldBills;
                      obj.PAGE = "ACCOUNTS DEBIT NOTE";

                      const logdata = accountspagelog.updateDebit(obj, req);
                      if (logdata.message && logdata.message !== null) {
                        notificationlog.savelog(logdata, res);
                      }
                      const trdetails = {};
                      trdetails.newtrans = Transdata;
                      trdetails.oldtrans = oldTrans;
                      res.io.sockets.emit("updatedebitcredittrans", trdetails);
            
                      return res.send({success: true, message: "Debit note entry updated successfully!", data: Transdata});
                    } else {
                      results.forEach((billdetails) => {
                        if (billdetails !== null && billdetails._id) {
                          BillModel.findByIdAndUpdate({_id: billdetails._id}, {paid: parseFloat(billdetails.paid)},
                            {upsert: true}, (bberr) => {});
                        }
                      });
                      return res.send({success: false, message: "Oops something happened please try again later!."});
                    }
                  });
                }
              });
            } else {
              return res.send({success: false, message: "Something went wrong please try again later."});
            }
          });
        } else {
          return res.send({success: false, message: "Debit amount allocated bill details not found."});
        }
      } else {
        return res.send({success: false, message: "Debit note transaction not found"});
      }
    });
  }
});

router.post("/updateCredit", (req, res) => {
  if (req.body.payment && req.body.payment !== null && req.body.payment._id && req.body.payment.transaction_amount &&
    req.body.payment.transaction_amount !== null && req.body.payment.transaction_amount !== "" &&
    parseFloat(req.body.payment.transaction_amount) > 0) {
    
    if (!req.body.payment.payee_id || (req.body.payment.payee_id && (req.body.payment.payee_id === "" || req.body.payment.payee_id === null))) {
      return res.send({success: false, message: "Please select customer to update this credit entry"});
    }
    
    if (!req.body.payment.user_type || (req.body.payment.user_type && (req.body.payment.user_type === "" || req.body.payment.user_type === null))) {
      return res.send({success: false, message: "Please select customer to update this credit entry"});
    }
    
    AccounttransModel.findOne({_id: req.body.payment._id}, (trerr, trdata) => {
      if (trerr) {
        res.status(499).send({message: errorhelper.getErrorMessage(trerr)});
      } else if (trdata && trdata !== null && trdata._id) {
        let oldTrans = JSON.parse(JSON.stringify(trdata));

        trdata.transaction_amount = req.body.payment.transaction_amount;
        trdata.ledger_id = req.body.payment.ledger_id;
        trdata.ledger_name = req.body.payment.ledger_name;
        trdata.memo = req.body.payment.memo;
        trdata.user_type = req.body.payment.user_type;
        trdata.invoice_nos = req.body.payment.invoice_nos;

        // schema before save actions
        trdata = commonfunction.beforeSavelargedata(trdata, req);

        trdata.save((terr, Transdata) => {
          if (terr) {
            res.status(499).send({message: errorhelper.getErrorMessage(terr)});
            return;
          } else if (Transdata && Transdata !== null && Transdata._id) {

            const obj = {};
            obj.data = Transdata;
            obj.data.oldTrans = oldTrans;
            obj.PAGE = "ACCOUNTS CREDIT NOTE";

            const logdata = accountspagelog.updateCredit(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            const trdetails = {};
            trdetails.newtrans = Transdata;
            trdetails.oldtrans = oldTrans;
            res.io.sockets.emit("updatedebitcredittrans", trdetails);
            return res.send({success: true, message: "Credit note entry updated successfully!", data: Transdata});
          } else {
            return res.send({success: false, message: "Oops something happened please try again later!."});
          }
        });
              
      } else {
        return res.send({success: false, message: "Credit note transaction not found"});
      }
    });
  }
});

router.get("/getpendingBills/:id", (req, res) => {
  if (req.params.id && req.params.id !== "") {
    async.parallel([
      function (callback) { // customer details
        let select = "name mobile_no";
        const query = CustomerModel.findOne({_id: req.params.id}, select);
        query.exec((err, cus) => {
          if (err) {
            callback(err);
          } else {
            callback(null, cus);
          }
        });
      },
      function (callback) { // Update Transfer from details
        const condition = {customer_id: req.params.id, payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
        const query = BillModel.find(condition);
        query.exec((err, Inv) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Inv);
          }
        });
      },
      function (callback) { // Update Transfer To details
        const query = CustomeropeningbalModel.findOne({customer_id: req.params.id, due_status: "Open", is_deleted: false, is_active: true});
        query.exec((err, openBal) => {
          if (err) {
            callback(err);
          } else {
            callback(null, openBal);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (results === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }

      const pendingData = {};
      pendingData.customerDetails = results[0] || [];
      pendingData.bills = results[1] || [];
      pendingData.customerbalance = results[2] || {};

      return res.send({success: true, data: pendingData});
    });
  }
});

router.post("/getpaidBills", (req, res) => {
  if (req.body.customer_id && req.body.customer_id !== "" && ((req.body.bills && req.body.bills !== "" && req.body.bills.length > 0) || 
          (req.body.openingbal && req.body.openingbal !== "" && req.body.openingbal !== null))) {
    async.parallel([
      function (callback) { // Update Transfer from details
        if (req.body.bills && req.body.bills !== "" && req.body.bills.length > 0) {
            const condition = {customer_id: req.body.customer_id, is_deleted: false, is_active: true, 
            $or: [{_id: {$in: req.body.bills}}, {payment_status: {$ne: "COMPLETED"}}]};
            const query = BillModel.find(condition);
            query.exec((err, Inv) => {
              if (err) {
                callback(err);
              } else {
                callback(null, Inv);
              }
            });
        } else {
          callback(null, []);
        }
      },
      function (callback) { // Update Transfer To details
        if (req.body.openingbal && req.body.openingbal !== "" && req.body.openingbal !== null) {
            const query = CustomeropeningbalModel.findOne({_id: req.body.openingbal, customer_id: req.body.customer_id});
            query.exec((err, openBal) => {
              if (err) {
                callback(err);
              } else {
                callback(null, openBal);
              }
            });
        } else {
          callback(null, {});
        }
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (results === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }

      const pendingData = {};
      pendingData.bills = results[0] || [];
      pendingData.customerbalance = results[1] || {};

      return res.send({success: true, data: pendingData});
    });
  }
});

router.post("/setFavourite", (req, res) => {
  if (req.body._id && req.body.favourite !== null) {
    AccountledgerModel.findOne({_id: req.body._id}, (err, ledger) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (ledger && ledger !== null && ledger._id) {
        // schema before save actions
        ledger = commonfunction.beforeSave(ledger, req);
        ledger.favourite = req.body.favourite;

        ledger.save((errs, led) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (led && led !== null && led._id) {
            res.send({success: true, message: `Ledger ${led.name} added to favourites!`});
          } else {
            res.send({success: false, message: "Something went wrong. Please try again later!"});
          }
        });
      } else {
        res.send({success: false, message: "Ledger not found"});
      }
    });
  }
});

// Get credit note trans
router.post("/getcreditnote", (req, res) => {
  if (req.body._id && req.body._id !== null) {
    const query = AccounttransModel.findOne({_id: req.body._id});

    query.exec((err, trans) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (trans && trans !== null && trans._id) {
        return res.send({success: true, data: trans});
      } else {
        return res.send({success: false, message: "Transactions not found"});
      }
    });
  }
});

router.post("/setFlag", (req, res) => {
  if (req.body.transactionId && req.body.superadmin_flag !== null) {
    let query = AccounttransModel.findOne({_id: req.body.transactionId});
    if (req.body.type === "Invoice") {
      query = BillModel.findOne({_id: req.body.transactionId});
    }
    query.exec((err, trdata) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (trdata && trdata !== null && trdata._id) {
        // schema before save actions
        trdata = commonfunction.beforeSave(trdata, req);
        trdata.superadmin_flag = req.body.superadmin_flag;
        trdata.superadmin_flag_added_by = req.session.username;
        trdata.superadmin_flag_user = req.session.id;

        trdata.save((errs, led) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (led && led !== null && led._id) {
            res.send({success: true, data: led});
          } else {
            res.send({success: false, message: "Something went wrong. Please try again later!"});
          }
        });
      } else {
        res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

router.post("/setdivisionFlag", (req, res) => {
  if (req.body.transactionId && req.body.divisionadmin_flag !== null) {
    let query = AccounttransModel.findOne({_id: req.body.transactionId});
    if (req.body.type === "Invoice") {
      query = BillModel.findOne({_id: req.body.transactionId});
    }
    query.exec((err, trdata) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (trdata && trdata !== null && trdata._id) {
        // schema before save actions
        trdata = commonfunction.beforeSave(trdata, req);
        trdata.divisionadmin_flag = req.body.divisionadmin_flag;
        trdata.divisionadmin_flag_added_by = req.session.username;
        trdata.divisionadmin_flag_user = req.session.id;

        trdata.save((errs, led) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (led && led !== null && led._id) {
            res.send({success: true, data: led});
          } else {
            res.send({success: false, message: "Something went wrong. Please try again later!"});
          }
        });
      } else {
        res.send({success: false, message: "Transaction not found"});
      }
    });
  }
});

router.get("/getDebitprefix/:division_id", (req, res) => {
  if (req.params.division_id && req.params.division_id !== null && req.params.division_id !== "") {
    const select = "debit_note";
    const condition = {division_id: req.params.division_id};
    const query = DivisionaccountModel.findOne(condition, select);

    query.exec((err, deb) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else {
        return res.send({success: true, data: deb});
      }
    });
  }
});

router.get("/getCreditprefix/:division_id", (req, res) => {
  if (req.params.division_id && req.params.division_id !== null && req.params.division_id !== "") {
    const select = "credit_note";
    const condition = {division_id: req.params.division_id};
    const query = DivisionaccountModel.findOne(condition, select);

    query.exec((err, cre) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else {
        return res.send({success: true, data: cre});
      }
    });
  }
});

router.get("/getcustomerPendingbills/:id", (req, res) => {
  if (req.params.id && req.params.id !== "") {
    const condition = {customer_id: req.params.id, payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
    const query = BillModel.find(condition);
    query.exec((err, Inv) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else {
        return res.send({success: true, data: Inv});
      }
    });
  }
});

module.exports = router;
