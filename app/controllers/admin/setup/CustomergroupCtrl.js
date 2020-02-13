const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const CustomergroupModel = require("../../../../app/models/CustomergroupsModel");
const DivisionModel = require("../../../../app/models/DivisionsModel");
const FabMeasureModel = require("../../../../app/models/FabMeasureModel");
const ProcessModel = require("../../../../app/models/ProcessModel");

function customergroupList(req, res) {
  async.parallel([
    function (callback) { // Fetch customer group details
      const query = CustomergroupModel.find({is_deleted: false}).populate("process_discount.division_id", "_id name")
        .populate("process_discount.process_id", "_id process_name")
        .populate("process_discount.measurement_id", "_id fabric_measure");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    },
    function (callback) { // Fetch division details
      const query = DivisionModel.find({is_deleted: false}, "name");
      query.exec((err, divisons) => {
        if (err) {
          callback(err);
        } else {
          callback(null, divisons);
        }
      });
    },
    function (callback) { // Fetch process details
      const query = ProcessModel.find({is_deleted: false}, "process_name division_id measurement");
      query.exec((err, process) => {
        if (err) {
          callback(err);
        } else {
          callback(null, process);
        }
      });
    },
    function (callback) { // Fetch fabric measurement details
      const query = FabMeasureModel.find({is_deleted: false}, "fabric_measure");
      query.exec((err, measurements) => {
        if (err) {
          callback(err);
        } else {
          callback(null, measurements);
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

    const customerGroups = {};
    customerGroups.groups = results[0] || [];
    customerGroups.divisions = results[1] || [];
    customerGroups.process = results[2] || [];
    customerGroups.measurement = results[3] || [];

    return res.send({success: true, data: customerGroups});
  });
}

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `customergroup ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", customergroupList);

// save the customer group
router.post("/create", (req, res) => {
  let newCustomergroup = new CustomergroupModel({
    name: req.body.name,
  });

  CustomergroupModel.find({}, (errs, data) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      return;
    } else if (!data || data.length === 0) {
      newCustomergroup.default = true;
    }
    // schema before save actions
    newCustomergroup = commonfunction.beforeSave(newCustomergroup, req);

    newCustomergroup.save((err, Customergroup) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else if (Customergroup && Customergroup !== null && Customergroup._id) {
        const obj = {};
        obj.data = Customergroup;
        obj.PAGE = "CUSTOMER GROUP";
        obj.PAGENAME = "Customer group";
        const logdata = mastersetuplog.create(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: `Customer group ${req.body.name} successfully created!`, data: Customergroup});
        return;
      }
      res.send({success: false, message: "Something went wrong. Please try again later!"});
    });
  });
});

router.post("/update", (req, res) => {
  CustomergroupModel.findOne({_id: req.body._id}, (err, customergroup) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (customergroup && customergroup !== null && customergroup._id) {
      // schema before save actions
      customergroup = commonfunction.beforeSave(customergroup, req);
      customergroup.name = req.body.name;

      customergroup.save((errs, groupdetail) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        } else if (groupdetail && groupdetail !== null && groupdetail._id) {
          const obj = {};
          obj.data = customergroup;
          obj.PAGE = "CUSTOMER GROUP";
          obj.PAGENAME = "Customer group";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Customer group ${groupdetail.name} successfully updated!`, data: groupdetail});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!"});
        }
      });
    } else {
      res.send({success: false, message: "Customer group not found"});
    }
  });
});

router.post("/updateDiscount", (req, res) => {
  if (req.body.group_discount && req.body.group_discount !== null && req.body.group_discount.length > 0) {
    CustomergroupModel.findOne({_id: req.body._id}, (err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (data && data !== null && data._id) {
        data = commonfunction.beforeSave(data, req);
        data.group_discount = req.body.group_discount;
        data.save((errs, groupdetail) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            return;
          } else if (groupdetail && groupdetail !== null && groupdetail._id) {
            const obj = {};
            obj.data = groupdetail;
            obj.PAGE = "CUSTOMER GROUP";
            obj.PAGENAME = "Customer group";
            const logdata = mastersetuplog.update(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            res.send({success: true, message: `Customer group ${groupdetail.name} Discounts successfully updated!`, data: groupdetail});
            return;
          }
          res.send({success: false, message: "Something went wrong. Please try again later!"});
        });
      } else {
        res.send({success: false, message: "Customer group not found"});
      }
    });
  }
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  CustomergroupModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err, groupdetail) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    const obj = {};
    obj.data = groupdetail;
    obj.PAGE = "CUSTOMER GROUP";
    obj.PAGENAME = "Customer group";
    const logdata = mastersetuplog.delete(obj, req);
    if (logdata.message && logdata.message !== null) {
      notificationlog.savelog(logdata, res);
    }

    res.send({success: true, message: "Customer group successfully deleted!"});
  });
});

module.exports = router;
