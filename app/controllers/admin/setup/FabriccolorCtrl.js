const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const FabColorModel = require("../../../../app/models/FabColorModel");

// list view
router.get("/list", (req, res) => {
  FabColorModel.find({is_deleted: false}).sort("fabric_color").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
});

// Create Color form
router.post("/create", (req, res) => {
  let newFab = new FabColorModel({
    fabric_color: req.body.fabric_color,
    color: req.body.color,
    fabric_color_code: req.body.fabric_color_code,
  });
    // schema before save actions
  newFab = commonfunction.beforeSave(newFab, req);

  newFab.save((err, fab) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (fab && fab !== null && fab._id) {
      const obj = {};
      obj.data = fab;
      obj.data.name = fab.fabric_color;
      obj.PAGE = "FABRIC COLOUR";
      obj.PAGENAME = "Fabric colour";
      const logdata = mastersetuplog.create(obj, req);
      if (logdata.message && logdata.message !== null) {
        notificationlog.savelog(logdata, res);
      }
      res.send({success: true, message: `Fabric color ${fab.fabric_color} is created!`, data: fab});
    } else {
      res.send({success: false, message: "Something went wrong. Please try again later!."});
    }
  });
});

// Color update
router.post("/update", (req, res) => {
  FabColorModel.findOne({_id: req.body._id}, (errs, fabs) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (fabs && fabs !== null && fabs._id) {
      // schema before save actions
      fabs = commonfunction.beforeSave(fabs, req);
      fabs.fabric_color = req.body.fabric_color;
      fabs.color = req.body.color;
      fabs.fabric_color_code = req.body.fabric_color_code;
      fabs.is_active = req.body.is_active;

      fabs.save((err, divis) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          obj.data.name = divis.fabric_color;
          obj.PAGE = "FABRIC COLOUR";
          obj.PAGENAME = "Fabric colour";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({success: true, message: `${divis.fabric_color} successfully updated!`, data: divis});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Colour details not found"});
    }
  });
});

router.post("/delete", (req, res) => { // Color form delete
  const query = {_id: req.body.id};
  FabColorModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "successfully deleted!"});
    }
  });
});

// Color enable/disable
router.post("/statusupdate", (req, res) => {
  FabColorModel.findOne({_id: req.body._id}, (errs, fabs) => {
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
        } else if (divis && divis !== null && divis._id) {
          const obj = {};
          obj.data = divis;
          obj.data.name = divis.fabric_color;
          obj.PAGE = "FABRIC COLOUR";
          obj.PAGENAME = "Fabric colour";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({success: true, message: `${divis.fabric_color} ${status} successfully `});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Colour details not found"});
    }
  });
});

module.exports = router;
