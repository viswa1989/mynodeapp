const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const purchaseorderlog = require("../../../../app/middlewares/purchaseorderlog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const smshelper = require("../../../../app/helpers/smsqueuehelper");
const express = require("express");

const router = express.Router();
const PurchaseorderModel = require("../../../../app/models/PurchaseorderModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const PreferenceModel = require("../../../../app/models/PreferenceModel");
const async = require("async");

function purchaseList(req, res) {
  const obj = {};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = req.body.filterData.division;
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = req.session.branch;
  }

  if (req.body.filterData && req.body.filterData.startswith && req.body.filterData.startswith !== "") {
    obj.name = new RegExp(`^${req.body.filterData.startswith}`, "i");
  }
  if (!req.body.filterData.skip || req.body.filterData.skip === null || req.body.filterData.skip === "") {
    req.body.filterData.skip = 0;
  }
  if (!req.body.filterData.limit || req.body.filterData.limit === null || req.body.filterData.limit === "") {
    req.body.filterData.limit = 0;
  }
  const select = "OTP delivery_date division_id order_date po_no purchase_details status total vendor notes";

  PurchaseorderModel.find(obj, select).sort({order_date: "desc"}).populate("vendor", "_id name").populate("division_id", "_id name")
    .skip(req.body.filterData.skip)
    .limit(req.body.filterData.limit)
    .exec((err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      res.send({success: true, data});
    });
}

/* CONTROLLER CONSTRUCTOR */
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view", "getgrn"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `purchase order ${arr[4]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.post("/list", purchaseList);

/* SAVE PURCHASE ORDER ITEM */
router.post("/create", (req, res) => {
  if (req.body.purchaseOrder && req.body.purchaseOrder.purchase_details && req.body.purchaseOrder.purchase_details.length > 0) {
    req.currentdivisionid = "";
    if (req.body.purchaseOrder.division_id && req.body.purchaseOrder.division_id !== null && req.body.purchaseOrder.division_id !== "") {
      req.currentdivisionid = req.body.purchaseOrder.division_id;
    } else if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      req.currentdivisionid = req.session.branch;
    }
    if (req.currentdivisionid !== "") {
      const condition = {division_id: req.currentdivisionid, "purchase.prefix": {$exists: true}};

      DivisionaccountModel.findOne(condition, (err, data) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (data && data !== null && data._id && data._id !== null && data._id !== "" && data.purchase && data.purchase !== null) {
          if (!data.purchase.prefix || data.purchase.prefix === null || data.purchase.prefix === "") {
            res.send({success: false,
              message: "Purchase order prefix not found for this division. Add prefix details for this division to continue"});
            return;
          }
          if (!data.purchase.serial_no || data.purchase.serial_no === null || data.purchase.serial_no === "") {
            res.send({success: false,
              message: "Purchase order running number not found for this division. Add running number details for this division to continue"});
            return;
          }
          let newPurchase = new PurchaseorderModel({
            division_id: req.currentdivisionid,
            //                        reference_no: req.body.purchaseOrder.reference_no,
            po_no: `${data.purchase.prefix}${data.purchase.serial_no}`,
            vendor: req.body.purchaseOrder.vendor,
            notes: req.body.purchaseOrder.notes,
            order_date: new Date(),
            delivery_date: req.body.purchaseOrder.delivery_date,
            total: req.body.purchaseOrder.total,
            status: "WAITING",
            OTP: commonfunction.generateOTP(6),
            purchase_details: req.body.purchaseOrder.purchase_details,
          });
          newPurchase = commonfunction.beforeSave(newPurchase, req);

          newPurchase.save((errs, purchase) => {
            if (errs) {
              res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            } else if (purchase && purchase._id) {
              data = commonfunction.beforeSave(data, req);
              if (data.purchase && data.purchase.serial_no && data.purchase.serial_no > 0) {
                data.purchase.serial_no += 1;
              }
              data.save((derr, division) => {
                if (derr) {
                  PurchaseorderModel.findByIdAndRemove(purchase._id, (remer) => {});
                  res.status(499).send({message: errorhelper.getErrorMessage(derr)});
                } else if (division && division !== null && division._id) {
                  PreferenceModel.findOne({module: "SMS", preference: "purchase_order_otp"}, "preference value",
                    (prerr, preference) => {
                    if (preference && preference !== null && preference._id && preference.value === "YES") {
                      PreferenceModel.findOne({module: "SMS", preference: "purchase_otp"}, "preference value",
                        (prefrr, preferdata) => {
                        if (preferdata && preferdata !== null && preferdata._id && preferdata.value !== "") {
                          const msgdt = purchase;
                          msgdt.mobile_no = preferdata.value;
                          smshelper.saveotp(msgdt);
                        }
                      });
                    }
                  });
                  
                  const obj = {};
                  const otpobj = {};
                  obj.data = purchase;
                  obj.PAGE = "PURCHASE ORDER";
                  otpobj.data = purchase;
                  otpobj.PAGE = "PURCHASE ORDER OTP";

                  const otpdata = purchaseorderlog.createPootp(otpobj, req);
                  const logdata = purchaseorderlog.savePo(obj, req);

                  if (otpdata.message && otpdata.message !== null) {
                    notificationlog.savelog(otpdata, res);
                  }
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }
                  res.send({success: true, message: "Purchase order generated successfully"});
                } else {
                  PurchaseorderModel.findByIdAndRemove(purchase._id, (remer) => {});
                  res.send({success: false, message: "Something went wrong please try again later!.."});
                }
              });
            } else {
              res.send({success: false, message: "Something went wrong please try again later!.."});
            }
          });
        } else {
          res.send({success: false,
            message: "Purchase order prefix and running no is not found for this division. Add running no and prefix details to continue."});
        }
      });
    } else {
      res.send({success: false, message: "Something went wrong please try again later!.."});
    }
  }
});

/* UPDATE PURCHASE ORDER ITEM */
router.post("/update", (req, res) => {
  if (req.body._id && req.body.purchase_details && req.body.purchase_details.length > 0) {
    const condition = {_id: req.body._id};

    PurchaseorderModel.findOne(condition, (err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (data && data !== null && data._id) {
        if (data.status === "WAITING" || data.status === "DENIED") {
          data.status = "WAITING";
          data.total = req.body.total;
          data.OTP = commonfunction.generateOTP(6);
          data.reference_no = req.body.reference_no;
          data.vendor = req.body.vendor;
          data.purchase_details = req.body.purchase_details;
          data.notes = req.body.notes;
          data = commonfunction.beforeSave(data, req);

          data.save((errs, po) => {
            if (errs) {
              res.status(499).send({message: errorhelper.getErrorMessage(errs)});
              return;
            } else if (po && po !== null && po._id) {
              PreferenceModel.findOne({module: "SMS", preference: "purchase_order_otp"}, "preference value",
                (prerr, preference) => {
                if (preference && preference !== null && preference._id && preference.value === "YES") {
                  PreferenceModel.findOne({module: "SMS", preference: "purchase_otp"}, "preference value",
                    (prefrr, preferdata) => {
                    if (preferdata && preferdata !== null && preferdata._id && preferdata.value !== "") {
                      const msgdt = po;
                      msgdt.mobile_no = preferdata.value;
                      smshelper.saveotp(msgdt);
                    }
                  });
                }
              });
              
              const obj = {};
              const otpobj = {};
              obj.data = po;
              obj.PAGE = "PURCHASE ORDER";
              otpobj.data = po;
              otpobj.PAGE = "PURCHASE ORDER OTP";

              const otpdata = purchaseorderlog.createPootp(otpobj, req);
              const logdata = purchaseorderlog.updatePo(obj, req);

              if (otpdata.message && otpdata.message !== null) {
                notificationlog.savelog(otpdata, res);
              }

              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }

              res.send({success: true, message: `Purchase order ${po.po_no} updated successfully`});
              return;
            }
            res.send({success: false, message: "Something went wrong please try again later!.."});
          });
        } else {
          res.send({success: false, message: "Sorry you cant edit this Purchase Order.This Order is not in a waiting / denied status"});
        }
      } else {
        res.send({success: false, message: "Purchase order not found"});
      }
    });
  }
});

router.get("/deny/:purchase_id", (req, res) => {
  const condition = {_id: req.params.purchase_id};

  PurchaseorderModel.findOne(condition, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (data && data !== null && data._id) {
      if (data.status === "WAITING") {
        data.status = "DENIED";

        data.save((errs, po) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (po && po !== null && po._id) {
            const obj = {};
            obj.data = po;
            obj.status = "Denied";
            obj.PAGE = "PURCHASE ORDER";
            const logdata = purchaseorderlog.updatePostatus(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            req.purchaseorder = {};
            req.purchaseorder._id = po._id;
            req.purchaseorder.status = po.status;
            res.io.sockets.emit("updatePurchaseorder", req.purchaseorder);

            res.send({success: true, message: `Purchase order ${po.po_no} denied successfully`});
          } else {
            res.send({success: false, message: "Something went wrong please try again later!.."});
          }
        });
      } else {
        res.send({success: false, message: "Sorry, you can't deny this Purchase Order.This Order is not in a waiting status"});
      }
    } else {
      res.send({success: false, message: "Purchase Order not found"});
    }
  });
});

router.get("/cancel/:purchase_id", (req, res) => {
  const condition = {_id: req.params.purchase_id};

  PurchaseorderModel.findOne(condition, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (data && data !== null && data._id) {
      if (data.status === "WAITING" || data.status === "DENIED") {
        data.status = "CANCELLED";

        data.save((errs, po) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            return;
          } else if (po && po !== null && po._id) {
            const obj = {};
            obj.data = po;
            obj.status = "Cancelled";
            obj.PAGE = "PURCHASE ORDER";
            const logdata = purchaseorderlog.updatePostatus(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            req.purchaseorder = {};
            req.purchaseorder._id = po._id;
            req.purchaseorder.status = po.status;
            res.io.sockets.emit("updatePurchaseorder", req.purchaseorder);

            res.send({success: true, message: `Purchase order ${po.po_no} cancelled successfully`});
            return;
          }
          res.send({success: false, message: "Something went wrong please try again later!.."});
        });
      } else {
        res.send({success: false, message: "Sorry you cant cancel this Purchase Order.This Order is not in a waiting / deny status"});
      }
    } else {
      res.send({success: false, message: "Purchase Order not found"});
    }
  });
});

router.get("/confirm/:purchase_id/:otp", (req, res) => {
  const condition = {_id: req.params.purchase_id, OTP: req.params.otp};

  PurchaseorderModel.findOne(condition, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (data && data !== null && data._id) {
      if (data.status === "WAITING") {
        data.status = "APPROVED";

        data.save((errS, po) => {
          if (errS) {
            res.status(499).send({message: errorhelper.getErrorMessage(errS)});
          } else if (po && po !== null && po._id) {
            const obj = {};
            obj.data = po;
            obj.status = "Approved";
            obj.PAGE = "PURCHASE ORDER";
            const logdata = purchaseorderlog.updatePostatus(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            req.purchaseorder = {};
            req.purchaseorder._id = po._id;
            req.purchaseorder.status = po.status;
            res.io.sockets.emit("updatePurchaseorder", req.purchaseorder);

            res.send({success: true, message: `Purchase order ${po.po_no} confirmed successfully`});
          } else {
            res.send({success: false, message: "Something went wrong please try again later!.."});
          }
        });
      } else {
        res.send({success: false, message: "Sorry you cant approve this Purchase Order.This Order is not in a waiting status"});
      }
    } else {
      res.send({success: false, message: "Purchase Order not found"});
    }
  });
});

router.get("/getPoautocomplete/:id", (req, res) => {
  const regex = new RegExp(req.params.id, "i");
  const condition = {division_id: req.session.branch,
    po_no: regex,
    status: "APPROVED",
    is_deleted: false,
    is_active: true,
    "purchase_details.0": {$exists: true}};
  const select = "_id po_no vendor purchase_details";
  const query = PurchaseorderModel.find(condition, select).populate("vendor", "_id name")
    .populate("purchase_details.product_id", "_id product_name").sort({created: -1})
    .limit(8);

  query.exec((err, category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data: category});
    }
  });
});

router.get("/getPurchasebydivision/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {division_id: req.params.id, is_deleted: false, is_active: true, "purchase_details.0": {$exists: true}};
    const select = "po_no vendor purchase_details order_date delivery_date status total";
    const query = PurchaseorderModel.find(condition, select).populate("vendor", "_id name").sort({created: -1}).limit(50);

    query.exec((err, purchase) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      res.send({success: true, data: purchase});
    });
  }
});

router.get("/printPodata/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    async.parallel([
      function (callback) { // Fetch invoice details
        const condition = {_id: req.params.id, is_deleted: false, is_active: true, "purchase_details.0": {$exists: true}};
        const select = "po_no vendor purchase_details order_date total notes";
        const query = PurchaseorderModel.findOne(condition, select).populate("vendor", "name address gstin_no mobile");

        query.exec((err, Po) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Po);
          }
        });
      },
      function (callback) { // Fetch Total dues
        PreferenceModel.find({module: "Company_info"}, "preference value", (err, preference) => {
          if (err) {
            callback(err);
          } else {
            const company_profile = {};
            async.each(preference, (pref, cb) => {
              if (pref.preference === 'address') {
                company_profile.address = pref.value;
              }
              if (pref.preference === 'phone_no') {
                company_profile.phone_no = pref.value;
              }
              if (pref.preference === 'email_id') {
                company_profile.email_id = pref.value;
              }
              if (pref.preference === 'gstin') {
                company_profile.gstin = pref.value;
              }

              cb(null);
            }, (errs) => {
              callback(null, company_profile);
            });
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (!results || results === null || !results[0] || results[0] === null) {
        res.status(499).send({message: "Purchase order not found."});
        return;
      }

      const initData = {};
      initData.Purchaseorder = results[0] || [];
      initData.Companyprofile = results[1] || [];

      return res.send({success: true, data: initData});
    });
  }
});

module.exports = router;
