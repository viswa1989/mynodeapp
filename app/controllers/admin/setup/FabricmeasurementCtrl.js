const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const FabMeasureModel = require("../../../../app/models/FabMeasureModel");

// Measure list here
function measurementList(req, res) {
  FabMeasureModel.find({is_deleted: false}).sort("fabric_color").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
}

// Create Measure form
router.post("/create", (req, res) => {
  let newFab = new FabMeasureModel({
    fabric_measure: req.body.fabric_measure,
  });
    // schema before save actions
  newFab = commonfunction.beforeSave(newFab, req);

  newFab.save((err, fab) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    } else if (fab && fab !== null && fab._id) {
      const obj = {};
      obj.data = fab;
      obj.data.name = fab.fabric_measure;
      obj.PAGE = "FABRIC MEASUREMENT";
      obj.PAGENAME = "Measurements";
      const logdata = mastersetuplog.create(obj, req);
      if (logdata.message && logdata.message !== null) {
        notificationlog.savelog(logdata, res);
      }
      res.send({success: true, message: `Fabric measure ${fab.fabric_measure} is created!`, data: fab});
      return;
    }
    res.send({success: false, message: "Something went wrong. Please try again later!."});
  });
});

// list view
router.get("/list", measurementList);

// Measure update form
router.post("/update", (req, res) => {
  FabMeasureModel.findOne({_id: req.body._id}, (errs, fabs) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (fabs && fabs !== null && fabs._id) {
      // schema before save actions
      fabs = commonfunction.beforeSave(fabs, req);
      fabs.fabric_measure = req.body.fabric_measure;
      fabs.is_active = req.body.is_active;

      fabs.save((err, divis) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          obj.data.name = divis.fabric_measure;
          obj.PAGE = "FABRIC MEASUREMENT";
          obj.PAGENAME = "Measurements";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({success: true, message: `${divis.fabric_measure} successfully updated!`, data: divis});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Measurement details not found"});
    }
  });
});

// Measure form delete
router.post("/delete", (req, res) => {
  const query = {_id: req.body.id};
  FabMeasureModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "successfully deleted!"});
    }
  });
});

// Measure enable/disable
router.post("/statusupdate", (req, res) => {
  FabMeasureModel.findOne({_id: req.body._id}, (errs, fabs) => {
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
          obj.data.name = divis.fabric_measure;
          obj.PAGE = "FABRIC MEASUREMENT";
          obj.PAGENAME = "Measurements";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({success: true, message: `${divis.fabric_measure} ${status} successfully`});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Measurement details not found"});
    }
  });
});

module.exports = router;
