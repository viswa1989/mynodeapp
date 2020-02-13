const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const fileUpload = require("../../../../app/helpers/fileUploader");
const DyeingDetailsModel = require("../../../../app/models/DyeingDetailsModel");

router.post("/create", (req, res) => {
  req.folder = `${global.fupload}dyeing_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];
  fileUpload(req, res, (err) => {
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
    const dye = JSON.parse(req.body.data);

    let dyeingmodel = new DyeingDetailsModel({
      dyeing_picture: req.fileName,
      dyeing_name: dye.dyeingForm.dyeing_name,
      dyeing_address: dye.dyeingForm.dyeing_address,
      dyeing_city: dye.dyeingForm.dyeing_city,
      dyeing_pin: dye.dyeingForm.dyeing_pin,
      dyeing_contact_person: dye.dyeingForm.dyeing_contact_person,
      gstin_no: dye.dyeingForm.gstin_no,
      pan_no: dye.dyeingForm.pan_no,
      dyeing_email: dye.dyeingForm.dyeing_email,
      dyeing_phone: dye.dyeingForm.dyeing_phone,
      is_active: dye.dyeingForm.is_active,
    });

    dyeingmodel = commonfunction.beforeSave(dyeingmodel, req);

    dyeingmodel.save((errs, dyeingData) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (dyeingData && dyeingData !== null && dyeingData._id) {
        const obj = {};
        obj.data = dyeingData;
        obj.data.name = dyeingData.dyeing_name;
        obj.PAGE = "DYEING DETAILS";
        obj.PAGENAME = "Dyeing details";
        const logdata = mastersetuplog.create(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }
        res.send({success: true, message: "Dyeing successfully created!", data: dyeingData});
      } else {
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      }
    });
  });
});

router.get("/list", (req, res) => {
  DyeingDetailsModel.find({is_deleted: false}).sort("dyeing_name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
});

router.post("/update", (req, res) => {
  DyeingDetailsModel.findOne({_id: req.body.dyeingForm._id}, (errs, dye) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (dye && dye !== null && dye._id) {
      dye = commonfunction.beforeSave(dye, req);

      dye.dyeing_picture = req.body.dyeingForm.dyeing_picture;
      dye.dyeing_name = req.body.dyeingForm.dyeing_name;
      dye.dyeing_address = req.body.dyeingForm.dyeing_address;
      dye.dyeing_city = req.body.dyeingForm.dyeing_city;
      dye.dyeing_pin = req.body.dyeingForm.dyeing_pin;
      dye.dyeing_contact_person = req.body.dyeingForm.dyeing_contact_person;
      dye.gstin_no = req.body.dyeingForm.gstin_no;
      dye.pan_no = req.body.dyeingForm.pan_no;
      dye.dyeing_email = req.body.dyeingForm.dyeing_email;
      dye.dyeing_phone = req.body.dyeingForm.dyeing_phone;
      dye.is_active = req.body.dyeingForm.is_active;

      dye.save((err, dyeings) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (dyeings && dyeings !== null && dyeings._id) {
          const obj = {};
          obj.data = dyeings;
          obj.data.name = dyeings.dyeing_name;
          obj.PAGE = "DYEING DETAILS";
          obj.PAGENAME = "Dyeing details";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Dyeing ${dyeings.dyeing_name} successfully updated!`, data: dyeings});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Dyeing details not found"});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  DyeingDetailsModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, message: "successfully deleted!"});
  });
});

router.post("/updatepicture", (req, res) => {
  req.folder = `${global.fupload}dyeing_picture`;
  req.allowedExt = [".jpg", ".jpeg", ".png"];
  fileUpload(req, res, (err) => {
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
    const dyeing = JSON.parse(req.body.data);
    const query = {_id: dyeing._id};

    DyeingDetailsModel.findOneAndUpdate(query, {$set: {dyeing_picture: req.fileName}}, (errs, dyes) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (dyes && dyes !== null && dyes._id) {
        const obj = {};
        obj.data = dyes;
        obj.data.name = dyes.dyeing_name;
        obj.PAGE = "DYEING DETAILS";
        obj.PAGENAME = "Dyeing details";
        const logdata = mastersetuplog.update(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
      } else {
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      }
    });
  });
});

// Dyeing enable/disable
router.post("/statusupdate", (req, res) => {
  DyeingDetailsModel.findOne({_id: req.body._id}, (errs, dye) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (dye && dye !== null && dye._id) {
      dye = commonfunction.beforeSave(dye, req);
      dye.is_active = req.body.is_active;
      let status = "disabled";
      if (dye.is_active) {
        status = "enabled";
      }
      dye.save((err, dyeings) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (dyeings && dyeings !== null && dyeings._id) {
          const obj = {};
          obj.data = dyeings;
          obj.data.name = dyeings.dyeing_name;
          obj.PAGE = "DYEING DETAILS";
          obj.PAGENAME = "Dyeing details";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Dyeing ${dyeings.dyeing_name} ${status} successfully`});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Dyeing details not found"});
    }
  });
});

router.get("/getDyeing/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const sel = "dyeing_name dyeing_address dyeing_city dyeing_pin";
  const query = DyeingDetailsModel.find({dyeing_name: regex, is_deleted: false}, sel).sort({created: -1}).limit(8);
  query.exec((err, cus) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data: cus});
    }
  });
});

module.exports = router;
