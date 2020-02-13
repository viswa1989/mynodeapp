const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const divisionpagelog = require("../../../../app/middlewares/divisionpagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const DivisionModel = require("../../../../app/models/DivisionsModel");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");
const StatelistModel = require("../../../../app/models/StatelistModel");
const ProcessModel = require("../../../../app/models/ProcessModel");

function List(req, res) {
  DivisionModel.find({is_deleted: false}).sort("name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
}

function saveAccountdata(divisionid, req, callback) {
  const defaultAccountdata = commonfunction.getdefaultAccount();
  if (defaultAccountdata) {
    let completedAcc = [];
    async.mapSeries(defaultAccountdata, (accdata, callbk) => {
      let accountledger = new AccountledgerModel(accdata);
      // schema before save actions
      accountledger = commonfunction.beforeSave(accountledger, req);
      accountledger.division_id = divisionid;
      
      accountledger.save((aerr, account) => {
        if (aerr) {
          callbk(aerr, completedAcc);
        } else if (account && account !== null && account._id) {
          completedAcc.push(account);
          callbk(null, completedAcc);
        } else {
          callbk(null, completedAcc);
        }
      });
    }, (err) => {
      if (err) {
        AccountledgerModel.remove({ division_id: divisionid }, (errs) => {});
        callback(errorhelper.getErrorMessage(err), null);
      } else {
        if (completedAcc.length === defaultAccountdata.length) {
          callback(null, completedAcc);
        } else {
          AccountledgerModel.remove({ division_id: divisionid }, (errs) => {});
          callback("Oops! something happened while creating default account for this division, please try again later!.", null);
        }
      }
    });
  } else {
    callback(null, defaultAccountdata);
  }
}

router.post("/create", (req, res) => {
  let newDivision = new DivisionModel({
    name: req.body.divisionForm.name,
    placeofSupply: req.body.divisionForm.placeofSupply,
    location: req.body.divisionForm.location,
    division_address: req.body.divisionForm.division_address,
    billing_address: req.body.divisionForm.billing_address,
    geolocation: req.body.divisionForm.geolocation,
  });

    // schema before save actions
  newDivision = commonfunction.beforeSave(newDivision, req);

  newDivision.save((err, division) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (division && division._id && division._id !== "") {
      saveAccountdata(division._id, req, (errs, acc) => {
        if (errs) {
            DivisionModel.findByIdAndRemove(division._id, (errrem) => { });
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            return;
        } else if (acc && acc !== null && acc.length>0) {
            const obj = {};
            obj.data = division;
            const logdata = divisionpagelog.create(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            res.send({success: true, message: `${req.body.divisionForm.name} successfully created!`, data: division});
            return;
        } else {
          DivisionModel.findByIdAndRemove(division._id, (errrem) => { });
          res.send({success: false, message: "Oops! Something went wrong please try again later!.."});
        }
      });
    } else {
      res.send({success: false, message: "Oops! Something went wrong please try again later!.."});
    }
  });
});

/** Default call function for list view */
router.get("/list", List);

router.post("/update", (req, res) => {
  DivisionModel.findOne({_id: req.body.divisionForm._id}, (err, divisions) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (divisions && divisions !== null && divisions._id) {
      // schema before save actions
      divisions = commonfunction.beforeSave(divisions, req);
      divisions.name = req.body.divisionForm.name;
      divisions.placeofSupply = req.body.divisionForm.placeofSupply;
      divisions.location = req.body.divisionForm.location;
      divisions.division_address = req.body.divisionForm.division_address;
      divisions.billing_address = req.body.divisionForm.billing_address;
      divisions.geolocation = req.body.divisionForm.geolocation;

      divisions.save((errs, divis) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          const logdata = divisionpagelog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `${divis.name} successfully updated!`});
          return;
        }
        res.send({success: false, message: "Oops! Something went wrong please try again later!.."});
      });
    } else {
      res.send({success: false, message: "Division details not found"});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body.id};
  DivisionModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "successfully deleted!"});
    }
  });
});

router.get("/view/:id", (req, res) => {
  DivisionModel.findOne({_id: req.params.id}).exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json(data);
    }
  });
});

router.get("/getallDivisiondetails", (req, res) => {
  req.filters = commonfunction.filterdateByparam("TODAY");
  async.parallel([
    function (callback) { // Fetch Division Details
      const condition = {is_deleted: false, is_active: true};
      if (req.session.branch) {
        condition._id = req.session.branch;
      }
      const query = DivisionModel.find(condition, "_id name").sort({created: -1});
      query.exec((err, division) => {
        if (err) {
          callback(err);
        }
        callback(null, division);
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }

    const initData = {};
    initData.divisions = results[0] || [];

    return res.send({success: true, data: initData});
  });
});

// getStatelist
router.get("/getStatelist", (req, res) => {
  StatelistModel.find({}, "name").sort({name: "asc"}).exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json(data);
    }
  });
});

router.get("/getDivisions", (req, res) => {
  async.parallel([
    function (callback) { // Fetch all branch details
      const conditions = {is_deleted: false, is_active: true};
      if (req.session.branch && req.session.branch !== null) {
        conditions._id = req.session.branch;
      }
      const query = DivisionModel.find(conditions, "_id name");
      query.exec((err, Branchdetail) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Branchdetail);
        }
      });
    },
    function (callback) { // Fetch process details
      const conditions = {is_deleted: false, is_active: true};
      if (req.session.branch && req.session.branch !== null) {
        conditions.division_id = req.session.branch;
      }
      const query = ProcessModel.find(conditions, "_id division_id process_name");
      query.exec((err, process) => {
        if (err) {
          callback(err);
        } else {
          callback(null, process);
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
    filterData.Divisiondetail = results[0] || [];
    filterData.Processdetail = results[1] || [];
    filterData.Currentbranch = req.session.branch;

    return res.send({success: true, data: filterData});
  });
});

module.exports = router;
