const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const divisionpagelog = require("../../../../app/middlewares/divisionpagelog");
const ledgerpagelog = require("../../../../app/middlewares/ledgerpagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");

function divisionaccountList(req, res) {
  let division_id = req.session.branch;
  if (req.params.id && req.params.id !== "") {
    division_id = req.params.id;
  }

  async.parallel([
    function (callback) { // Fetch division account details by division id
      const query = DivisionaccountModel.findOne({division_id});
      query.exec((err, Divisionaccount) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Divisionaccount);
        }
      });
    },
    function (callback) { // Fetch account ledger details by division id
      const query = AccountledgerModel.findOne({division_id});
      query.exec((err, accountledger) => {
        if (err) {
          callback(err);
        } else {
          callback(null, accountledger);
        }
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }

    if (results === null || (results[0] === null && results[1] === null)) {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }

    const divisionaccountData = {};
    divisionaccountData.Divisionaccount = results[0] || [];
    divisionaccountData.accountledger = results[1] || [];

    return res.send({success: true, data: divisionaccountData});
  });
}

router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `branchaccount ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list/:id", divisionaccountList);

router.get("/me", (req, res) => {
  DivisionaccountModel.find({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

// SAVE BRANCH ACCOUNT
router.post("/create", (req, res) => {
  async.parallel([
    function (callback) {
      DivisionaccountModel.findOne({division_id: req.body.divisionaccountForm.division_id}, (err, Divisionaccount) => {
        if (err) {
          callback(err);
        } else if (!Divisionaccount) {
          let newDivisionaccount = new DivisionaccountModel();
          // schema before save actions
          newDivisionaccount = commonfunction.beforeSave(newDivisionaccount, req);

          newDivisionaccount.division_id = req.body.divisionaccountForm.division_id;
          newDivisionaccount.receive_note = req.body.divisionaccountForm.receive_note;
          newDivisionaccount.delivery_note = req.body.divisionaccountForm.delivery_note;
          newDivisionaccount.return_note = req.body.divisionaccountForm.return_note;
          newDivisionaccount.invoice = req.body.divisionaccountForm.invoice;
          newDivisionaccount.grn = req.body.divisionaccountForm.grn;
          newDivisionaccount.purchase = req.body.divisionaccountForm.purchase;
          newDivisionaccount.purchase_return = req.body.divisionaccountForm.purchase_return;
          newDivisionaccount.credit_note = req.body.divisionaccountForm.credit_note;
          newDivisionaccount.debit_note = req.body.divisionaccountForm.debit_note;
          newDivisionaccount.order = req.body.divisionaccountForm.order;
          newDivisionaccount.inward = req.body.divisionaccountForm.inward;
          newDivisionaccount.outward = req.body.divisionaccountForm.outward;
          newDivisionaccount.contract_inward = req.body.divisionaccountForm.contract_inward;
          newDivisionaccount.contract_outward = req.body.divisionaccountForm.contract_outward;
          newDivisionaccount.return = req.body.divisionaccountForm.return;

          newDivisionaccount.save((errs, accountssetting) => {
            if (errs || !accountssetting) {
              callback(errs);
            } else {
              const obj = {};
              obj.data = accountssetting;
              obj.PAGE = "BRANCH ACCOUNT PREFIX";
              const logdata = divisionpagelog.createprefix(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
              callback(null, accountssetting);
            }
          });
        } else {
          // schema before save actions
          Divisionaccount = commonfunction.beforeSave(Divisionaccount, req);

          Divisionaccount.division_id = req.body.divisionaccountForm.division_id;
          Divisionaccount.receive_note = req.body.divisionaccountForm.receive_note;
          Divisionaccount.delivery_note = req.body.divisionaccountForm.delivery_note;
          Divisionaccount.return_note = req.body.divisionaccountForm.return_note;
          Divisionaccount.invoice = req.body.divisionaccountForm.invoice;
          Divisionaccount.grn = req.body.divisionaccountForm.grn;
          Divisionaccount.purchase = req.body.divisionaccountForm.purchase;
          Divisionaccount.purchase_return = req.body.divisionaccountForm.purchase_return;
          Divisionaccount.credit_note = req.body.divisionaccountForm.credit_note;
          Divisionaccount.debit_note = req.body.divisionaccountForm.debit_note;
          Divisionaccount.order = req.body.divisionaccountForm.order;
          Divisionaccount.inward = req.body.divisionaccountForm.inward;
          Divisionaccount.outward = req.body.divisionaccountForm.outward;
          Divisionaccount.contract_inward = req.body.divisionaccountForm.contract_inward;
          Divisionaccount.contract_outward = req.body.divisionaccountForm.contract_outward;
          Divisionaccount.return = req.body.divisionaccountForm.return;
          Divisionaccount.save((errs, accountssetting) => {
            if (errs || !accountssetting) {
              callback(errs);
            } else {
              const obj = {};
              obj.data = accountssetting;
              obj.PAGE = "BRANCH ACCOUNT PREFIX";
              const logdata = divisionpagelog.updateprefix(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
              callback(null, accountssetting);
            }
          });
        }
      });
    },
    function (callback) {
      let condition = {division_id: req.body.divisionaccountForm.division_id, default: true, type: "CASH"};
      if (req.body.divisionaccountForm.accounts && req.body.divisionaccountForm.accounts._id && req.body.divisionaccountForm.accounts._id !== "") {
        condition = {_id: req.body.divisionaccountForm.accounts._id};
      }
      const query = AccountledgerModel.findOne(condition);

      query.exec((err, accountledger) => {
        if (err) {
          callback(err);
        } else if (!accountledger) {
          let newaccountledger = new AccountledgerModel();
          // schema before save actions
          newaccountledger = commonfunction.beforeSave(newaccountledger, req);

          newaccountledger.division_id = req.body.divisionaccountForm.division_id;
          newaccountledger.opening_balance = parseFloat(req.body.divisionaccountForm.accounts.opening_balance);
          newaccountledger.current_balance = parseFloat(req.body.divisionaccountForm.accounts.opening_balance);
          newaccountledger.opening_date = req.body.divisionaccountForm.accounts.opening_date;
          newaccountledger.name = req.body.divisionaccountForm.accounts.name;
          newaccountledger.type = req.body.divisionaccountForm.accounts.type;
          newaccountledger.default = req.body.divisionaccountForm.accounts.default;

          newaccountledger.save((errs, account) => {
            if (errs || !account) {
              callback(errs);
            } else {
              const obj = {};
              obj.data = account;
              obj.PAGE = "BRANCH ACCOUNT";
              const logdata = ledgerpagelog.create(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
              callback(null, account);
            }
          });
        } else {
          // schema before save actions
          accountledger = commonfunction.beforeSave(accountledger, req);

          accountledger.division_id = req.body.divisionaccountForm.division_id;
          accountledger.opening_balance = parseFloat(req.body.divisionaccountForm.accounts.opening_balance);
          accountledger.current_balance = parseFloat(req.body.divisionaccountForm.accounts.opening_balance);
          accountledger.opening_date = req.body.divisionaccountForm.accounts.opening_date;
          accountledger.name = req.body.divisionaccountForm.accounts.name;
          accountledger.type = req.body.divisionaccountForm.accounts.type;
          accountledger.default = req.body.divisionaccountForm.accounts.default;

          accountledger.save((errs, account) => {
            if (errs || !account) {
              callback(errs);
            } else {
              const obj = {};
              obj.data = account;
              obj.PAGE = "BRANCH ACCOUNT";
              const logdata = ledgerpagelog.update(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
              callback(null, account);
            }
          });
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

    const divisionaccountData = {};
    divisionaccountData.Divisionaccount = results[0] || [];
    divisionaccountData.accountledger = results[1] || [];

    return res.send({success: true, message: "Division account updated successfully.", data: divisionaccountData});
  });
});

// UPDATE BRANCH ACCOUNT
router.post("/update", (req, res) => {
  DivisionaccountModel.findOne({division_id: req.body.branchaccountForm.division_id}, (errs, branchacc) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (branchacc && branchacc !== null && branchacc._id) {
      // schema before save actions
      branchacc = commonfunction.beforeSave(branchacc, req);
      branchacc.division_id = req.body.branchaccountForm.division_id;
      branchacc.grn = req.body.branchaccountForm.grn;
      branchacc.invoice = req.body.branchaccountForm.invoice;
      branchacc.purchase = req.body.branchaccountForm.purchase;
      branchacc.sales = req.body.branchaccountForm.sales;
      branchacc.jobcard = req.body.branchaccountForm.jobcard;
      branchacc.order = req.body.branchaccountForm.order;
      branchacc.inward = req.body.branchaccountForm.inward;
      branchacc.contract_inward = req.body.branchaccountForm.contract_inward;
      branchacc.contract_outward = req.body.branchaccountForm.contract_outward;
          
      branchacc.save((err, account) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (account && account !== null && account._id) {
          const obj = {};
          obj.data = account;
          obj.PAGE = "BRANCH ACCOUNT PREFIX";
          const logdata = divisionpagelog.updateprefix(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          AccountledgerModel.findOne({division_id: req.body.branchaccountForm.division_id}, (aerr, accledger) => {
            if (aerr) {
              res.status(499).send({message: errorhelper.getErrorMessage(aerr)});
            } else if (accledger && accledger !== null && accledger._id) {
              // schema before save actions
              accledger = commonfunction.beforeSave(accledger, req);
              accledger.division_id = req.body.branchaccountForm.division_id;
              accledger.current_balance -= (accledger.opening_balance - req.body.branchaccountForm.accounts.opening_balance);
              accledger.opening_balance = req.body.branchaccountForm.accounts.opening_balance;
              accledger.opening_date = req.body.branchaccountForm.accounts.opening_date;

              accledger.save((acerr, accupdate) => {
                if (acerr) {
                  res.status(499).send({message: errorhelper.getErrorMessage(acerr)});
                  return;
                } else if (accupdate && accupdate !== null && accupdate._id) {
                  const objs = {};
                  objs.data = accupdate;
                  objs.PAGE = "BRANCH ACCOUNT";
                  const ledglogdata = ledgerpagelog.update(objs, req);
                  if (ledglogdata.message && ledglogdata.message !== null) {
                    notificationlog.savelog(ledglogdata, res);
                  }

                  res.send({success: true, message: "Division Account successfully updated!"});
                  return;
                }
                return res.send({success: false, message: "Something went wrong please try again later!."});
              });
            } else {
              return res.send({success: false, message: "Account ledger details not found"});
            }
          });
        } else {
          return res.send({success: false, message: "Prefix details not found"});
        }
      });
    } else {
      return res.send({success: false, message: "Prefix details not found"});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  DivisionaccountModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err, accledger) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send("Brand successfully deleted!");
  });
});

router.get("/view/:id", (req, res) => {
  DivisionaccountModel.find({_id: req.params.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

module.exports = router;
