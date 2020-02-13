const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const accountspayrolllog = require("../../../../app/middlewares/accountspayrolllog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const async = require("async");
const TaxModel = require("../../../../app/models/TaxesModel");

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `taxes ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", (req, res) => {
  const query = TaxModel.find({is_deleted: false});

  query.exec((err, tax) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      return res.send({success: true, data: tax});
    }
  });
});

// save the taxes
router.post("/create", (req, res) => {
  if (req.body.tax_name && req.body.tax_percentage && req.body.tax_name !== "" && req.body.tax_percentage !== "") {
    let newTax = new TaxModel({
      tax_name: req.body.tax_name,
      tax_percentage: req.body.tax_percentage,
    });
    // schema before save actions
    newTax = commonfunction.beforeSave(newTax, req);

    newTax.save((err, taxData) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (taxData && taxData !== null && taxData._id) {
        const obj = {};
        obj.data = taxData;
        obj.PAGE = "TAX";
        const logdata = accountspayrolllog.createTax(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: "Tax details successfully created!", data: taxData});
      } else {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }
    });
  }
});

router.post("/update", (req, res) => {
  async.mapSeries(req.body.tax_class, (tax, callback) => {
    if (tax._id && tax._id !== "") {
      TaxModel.findOne({_id: tax._id}, (err, taxdata) => {
        if (err) {
          callback(err, null);
        } else if (taxdata && taxdata !== null && taxdata._id) {
          // schema before save actions
          taxdata = commonfunction.beforeSave(taxdata, req);
          taxdata.tax_description = tax.tax_description;
          taxdata.tax_name = tax.tax_name;
          taxdata.tax_percentage = tax.tax_percentage;

          taxdata.save((errs, taxDetail) => {
            if (errs) {
              callback(errs, null);
            } else if (taxDetail && taxDetail !== null && taxDetail._id) {
              req.executedstatement = taxDetail;
              callback(null, req.executedstatement);
            } else {
              req.executedstatement = taxDetail;
              callback(null, req.executedstatement);
            }
          });
        }
      });
    } else {
      let taxdata = new TaxModel();
      // schema before save actions
      taxdata = commonfunction.beforeSave(taxdata, req);
      taxdata.tax_description = tax.tax_description;
      taxdata.tax_name = tax.tax_name;
      taxdata.tax_percentage = tax.tax_percentage;

      taxdata.save((errs, taxDetail) => {
        if (errs) {
          callback(errs, null);
        } else if (taxDetail && taxDetail !== null && taxDetail._id) {
          req.executedstatement = taxDetail;
          callback(null, req.executedstatement);
        } else {
          req.executedstatement = taxDetail;
          callback(null, req.executedstatement);
        }
      });
    }
  }, (err, result) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }

    const obj = {};
    obj.data = {};
    obj.PAGE = "TAX";
    const logdata = accountspayrolllog.updateTax(obj, req);
    if (logdata.message && logdata.message !== null) {
      notificationlog.savelog(logdata, res);
    }

    return res.send({success: true, message: "Tax details successfully updated!"});
  });
});

router.post("/updatestatus", (req, res) => {
  TaxModel.findOne({_id: req.body.id}, (err, taxes) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (taxes && taxes !== null && taxes._id) {
      // schema before save actions
      taxes = commonfunction.beforeSave(taxes, req);
      taxes.is_active = req.body.is_active;

      taxes.save((errs, taxdetail) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (taxdetail && taxdetail !== null && taxdetail._id) {
          res.send({success: true, message: `${taxdetail.name} successfully updated!`, data: taxdetail});
          return;
        }
        return res.send({success: false, message: "Something went wrong please try again later!."});
      });
    } else {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};

  TaxModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, {runValidators: true}, (err, taxdetails) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    const obj = {};
    obj.data = taxdetails;
    obj.PAGE = "TAX";
    const logdata = accountspayrolllog.deleteTax(obj, req);
    if (logdata.message && logdata.message !== null) {
      notificationlog.savelog(logdata, res);
    }

    res.send({success: true, message: "Tax details successfully deleted!"});
  });
});

module.exports = router;
