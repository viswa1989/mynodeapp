const auth = require("../../../../app/middlewares/auth");
const errorhelper = require("../../../../app/helpers/errorhelper");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const VendorModel = require("../../../../app/models/VendorModel");
const FUpload = require("../../../../app/helpers/fileUploader");

function vendorList(req, res) {
  VendorModel.find({is_deleted: false}).sort("name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
}

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `vendor ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", vendorList);

router.get("/me", (req, res) => {
  VendorModel.find({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json(data);
    }
  });
});

// save the vendor
router.post("/create", (req, res) => {
  req.folder = `${global.fupload}vendor_picture`;
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
    const vendor = JSON.parse(req.body.data);

    let newVendor = new VendorModel({
      name: vendor.name,
      code: vendor.code,
      email: vendor.email,
      mobile: vendor.mobile,
      gstin_no: vendor.gstin_no,
      pan_no: vendor.pan_no,
      vendor_picture: req.fileName,
      address: vendor.address,
      contactperson_name: vendor.contactperson_name,
      contactperson_email: vendor.contactperson_email,
      contactperson_mobile: vendor.contactperson_mobile,
      is_active: vendor.is_active,
    });
    // schema before save actions
    newVendor = commonfunction.beforeSave(newVendor, req);

    newVendor.save((errs, vendors) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        return;
      } else if (vendors && vendors !== null && vendors._id) {
        const obj = {};
        obj.data = vendors;
        obj.PAGE = "VENDOR";
        obj.PAGENAME = "Vendor";
        const logdata = mastersetuplog.create(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: `Vendor ${vendors.name} successfully created!`, data: vendors});
        return;
      }
      res.send({success: false, message: "Something went wrong. Please try again later!."});
    });
  });
});

// update the vendor
router.post("/update", (req, res) => {
  VendorModel.findOne({_id: req.body.vendorForm._id}, (errs, vendor) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (vendor && vendor !== null && vendor._id) {
      vendor = commonfunction.beforeSave(vendor, req);
      vendor.name = req.body.vendorForm.name;
      vendor.code = req.body.vendorForm.code;
      vendor.email = req.body.vendorForm.email;
      vendor.mobile = req.body.vendorForm.mobile;
      vendor.contactperson_name = req.body.vendorForm.contactperson_name;
      vendor.contactperson_email = req.body.vendorForm.contactperson_email;
      vendor.contactperson_mobile = req.body.vendorForm.contactperson_mobile;
      vendor.gstin_no = req.body.vendorForm.gstin_no;
      vendor.pan_no = req.body.vendorForm.pan_no;
      vendor.vendor_picture = req.body.vendorForm.vendor_picture;
      vendor.address = req.body.vendorForm.address;
      vendor.is_active = req.body.vendorForm.is_active;

      vendor.save((err, vendors) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (vendors && vendors !== null && vendors._id) {
          const obj = {};
          obj.data = vendors;
          obj.PAGE = "VENDOR";
          obj.PAGENAME = "Vendor";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Vendor ${vendors.name} successfully updated!`, data: vendors});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Vendor details not found"});
    }
  });
});

router.post("/update_picture", (req, res) => {
  req.folder = `${global.fupload}vendor_picture`;
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
    } else {
      const vendor = JSON.parse(req.body.data);
      const query = {_id: vendor._id};

      VendorModel.findOneAndUpdate(query, {$set: {vendor_picture: req.fileName}}, (errs, vendors) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (vendors && vendors !== null && vendors._id) {
          res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    }
  });
});

// delete the vendor
router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};

  VendorModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err, vendor) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (vendor && vendor !== null && vendor._id) {
      res.send({success: true, message: `Vendor ${req.body.name} successfully deleted!`});
    } else {
      res.send({success: false, message: "Vendor not found"});
    }
  });
});

// view vendor
router.get("/view/:id", (req, res) => {
  const query = VendorModel.findOne({_id: req.params.id}).populate("brand._id", "_id name");

  query.exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

router.get("/getVendorautocomplete/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const query = VendorModel.find({name: regex, is_deleted: false, is_active: true}, "_id name").sort({created: -1}).limit(8);

  query.exec((err, category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data: category});
  });
});

// vendor enable/disable
router.post("/statusupdate", (req, res) => {
  VendorModel.findOne({_id: req.body._id}, (errs, vendor) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (vendor && vendor !== null && vendor._id) {
      vendor = commonfunction.beforeSave(vendor, req);
      vendor.is_active = req.body.is_active;
      let status = "disabled";
      if (vendor.is_active) {
        status = "enabled";
      }
      vendor.save((err, vendors) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (vendors && vendors !== null && vendors._id) {
          const obj = {};
          obj.data = vendors;
          obj.PAGE = "VENDOR";
          obj.PAGENAME = "Vendor";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Vendor ${vendors.name} ${status} successfully`});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Vendor details not found"});
    }
  });
});

module.exports = router;
