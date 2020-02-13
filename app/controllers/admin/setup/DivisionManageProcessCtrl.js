const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const async = require("async");
const FUpload = require("../../../../app/helpers/fileUploader");
const ProcessModel = require("../../../../app/models/ProcessModel");
const FabMeasureModel = require("../../../../app/models/FabMeasureModel");
const TaxesModel = require("../../../../app/models/TaxesModel");

router.post("/create", (req, res) => {
  req.folder = `${global.fupload}process_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];
  FUpload(req, res, (err) => {
    if (err) {
      if (req.errortxt) {
        res.status(499).send({message: req.errortxt});
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(499).send({message: "File too large"});
      } else {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      }
      return;
    }
    const proc = JSON.parse(req.body.data);
    let processmodel = new ProcessModel({
      division_id: proc.division_id,
      process_picture: req.fileName,
      process_name: proc.process_name,
      process_code: proc.process_code,
      hsn_code: proc.hsn_code,
      color: proc.color,
      tax_class: proc.tax_class,
      inter_tax_class: proc.inter_tax_class,
      measurement: proc.measurement,
      invoice_option: proc.invoice_option,
      is_active: proc.is_active,
    });

    processmodel = commonfunction.beforeSave(processmodel, req);

    processmodel.save((errs, processData) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (processData && processData !== null && processData._id) {
        ProcessModel.findOne({_id: processData._id}).populate("division_id", "_id name").exec((inerrs, intrans) => {
          if (intrans && intrans !== null && intrans._id) {
            const obj = {};
            obj.data = intrans;
            obj.data.name = intrans.process_name;
            obj.PAGE = "PROCESS";
            const logdata = mastersetuplog.createProcess(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
          }
        });
        res.send({success: true, message: `Process ${processData.process_name} successfully created!`, data: processData});
      } else {
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      }
    });
  });
});

router.get("/initialize/:id", (req, res) => {
  async.parallel([
    function (callback) {
      const select = "_id tax_name tax_percentage";
      const query = ProcessModel.find({is_deleted: false, division_id: req.params.id}).populate("tax_class", select)
        .populate("inter_tax_class", select).sort("process_name");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
      });
    },
    function (callback) {
      const query = FabMeasureModel.find({is_deleted: false}, "fabric_measure").sort("fabric_measure");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
      });
    },
    function (callback) {
      const query = TaxesModel.find({is_deleted: false}).sort("tax_percentage");
      query.exec((err, data) => {
        if (err) {
          callback(err);
        }
        callback(null, data);
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

    const obj = {};
    obj.process = results[0] || [];
    obj.measurement = results[1] || [];
    obj.tax = results[2] || [];

    return res.send({success: true, data: obj});
  });
});

router.post("/update", (req, res) => {
  ProcessModel.findOne({_id: req.body.processForm._id}, (err, proc) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (proc && proc !== null && proc._id) {
      proc = commonfunction.beforeSave(proc, req);

      proc.division_id = req.body.division_id;
      proc.process_picture = req.body.processForm.process_picture;
      proc.process_name = req.body.processForm.process_name;
      proc.process_code = req.body.processForm.process_code;
      proc.hsn_code = req.body.processForm.hsn_code;
      proc.color = req.body.processForm.color;
      proc.tax_class = req.body.processForm.tax_class;
      proc.inter_tax_class = req.body.processForm.inter_tax_class;
      proc.measurement = req.body.processForm.measurement;
      proc.invoice_option = req.body.processForm.invoice_option;
      proc.is_active = req.body.processForm.is_active;
      
      proc.save((errs, processmodel) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (processmodel && processmodel !== null && processmodel._id) {
          ProcessModel.findOne({_id: processmodel._id}).populate("division_id", "_id name").exec((inerrs, intrans) => {
            if (intrans && intrans !== null && intrans._id) {
              const obj = {};
              obj.data = intrans;
              obj.data.name = intrans.process_name;
              obj.PAGE = "PROCESS";
              const logdata = mastersetuplog.updateProcess(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
            }
          });
          res.send({success: true, message: `Process ${processmodel.process_name} successfully updated!`, data: processmodel});
          return;
        }
        res.send({success: false, message: "Process data not found"});
      });
    }
  });
});

router.post("/update_picture", (req, res) => {
  req.folder = `${global.fupload}process_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];
  FUpload(req, res, (err) => {
    if (err) {
      if (req.errortxt) {
        res.status(499).send({message: req.errortxt});
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(499).send({message: "File too large"});
      } else {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      }
      return;
    }
    const process = JSON.parse(req.body.data);

    const query = {_id: process._id};

    ProcessModel.findOneAndUpdate(query, {$set: {process_picture: req.fileName}}, (errs, procs) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        return;
      } else if (procs && procs !== null && procs._id) {
        res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
        return;
      }
      return res.send({success: false, message: "Something went wrong please try again later!."});
    });
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};

  ProcessModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "Process successfully deleted!"});
    }
  });
});

// Process enable/disable
router.post("/statusupdate", (req, res) => {
  ProcessModel.findOne({_id: req.body._id}, (errs, fabs) => {
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
          res.send({success: true, message: `${divis.process_name} ${status} successfully`});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Process data not found"});
    }
  });
});

module.exports = router;
