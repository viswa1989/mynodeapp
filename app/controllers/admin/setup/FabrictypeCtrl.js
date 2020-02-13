const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const FabTypeModel = require("../../../../app/models/FabTypeModel");

// list view
router.get("/list", (req, res) => {
  FabTypeModel.find({is_deleted: false}).sort("fabric_type").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
});

// create FabType
router.post("/create", (req, res) => {
  let newFab = new FabTypeModel({
    fabric_type: req.body.fabric_type,
    color: req.body.color,
  });
    // schema before save actions
  newFab = commonfunction.beforeSave(newFab, req);

  newFab.save((err, fab) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (fab && fab !== null && fab._id) {
      const obj = {};
      obj.data = fab;
      obj.data.name = fab.fabric_type;
      obj.PAGE = "FABRIC TYPE";
      obj.PAGENAME = "Fabric type";
      const logdata = mastersetuplog.create(obj, req);
      if (logdata.message && logdata.message !== null) {
        notificationlog.savelog(logdata, res);
      }
      res.send({success: true, message: `Fabric type ${fab.fabric_type} is created!`, data: fab});
    } else {
      res.send({success: false, message: "Something went wrong. Please try again later!."});
    }
  });
});

// FabType update
router.post("/update", (req, res) => {
  FabTypeModel.findOne({_id: req.body._id}, (errs, fabs) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (fabs && fabs !== null && fabs._id) {
      // schema before save actions
      fabs = commonfunction.beforeSave(fabs, req);
      fabs.fabric_type = req.body.fabric_type;
      fabs.is_active = req.body.is_active;
      //            fabs.color = req.body.color;

      fabs.save((err, divis) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          obj.data.name = divis.fabric_type;
          obj.PAGE = "FABRIC TYPE";
          obj.PAGENAME = "Fabric type";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `${divis.fabric_type} successfully updated!`, data: divis});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Fabric details not found"});
    }
  });
});

// FabType form delete
router.post("/delete", (req, res) => {
  const query = {_id: req.body.id};
  FabTypeModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "successfully deleted!"});
    }
  });
});

// FabType enable/disable
router.post("/statusupdate", (req, res) => {
  FabTypeModel.findOne({_id: req.body._id}, (errs, fabs) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (fabs && fabs !== null && fabs._id) {
      // schema before save actions
      fabs = commonfunction.beforeSave(fabs, req);
      fabs.is_active = req.body.is_active;
      let status = "disabled";
      if (fabs.is_active) {
        status = "enabled";
      }
      fabs.save((err, divis) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          obj.data.name = divis.fabric_type;
          obj.PAGE = "FABRIC TYPE";
          obj.PAGENAME = "Fabric type";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `${divis.fabric_type} ${status} successfully`});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Fabric details not found"});
    }
  });
});

// Fetch customer and order details
router.post("/getfabricDetails", (req, res) => {
  if (req.body.fabric && req.body.fabric !== "") {
    const re = new RegExp(req.body.fabric, "i");
    const query = FabTypeModel.find({fabric_type: {$regex: re}, is_deleted: false, is_active: true}, "_id fabric_type color");

    query.exec((err, fabtype) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: fabtype});
    });
  }
});
module.exports = router;
