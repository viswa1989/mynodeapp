const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const fileUpload = require("../../../../app/helpers/fileUploader");
const ContractorModel = require("../../../../app/models/ContractorModel");
const ContractorprocessModel = require("../../../../app/models/ContractorprocessModel");

router.post("/create", (req, res) => {
  req.folder = `${global.fupload}contractor_picture`;
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
    const contract = JSON.parse(req.body.data);
    let contractorModel = new ContractorModel({
      profile_picture: req.fileName,
      company_name: contract.company_name,
      phone_no: contract.phone_no,
      email_id: contract.email_id,
      address1: contract.address1,
      address2: contract.address2,
      pin_code: contract.pin_code,
      contact_person: contract.contact_person,
      mobile_no: contract.mobile_no,
      contactemail_id: contract.contactemail_id,
      gstin_number: contract.gstin_number,
      pan_no: contract.pan_no,
    });

    contractorModel = commonfunction.beforeSave(contractorModel, req);

    contractorModel.save((errs, contractdata) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (contractdata && contractdata !== null && contractdata._id) {
        const obj = {};
        obj.data = contractdata;
        obj.data.name = contractdata.company_name;
        obj.PAGE = "CONTRACTOR DETAILS";
        obj.PAGENAME = "Contractor details";
        const logdata = mastersetuplog.create(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }
        res.send({success: true, message: `Contractor ${contractdata.company_name} successfully created!`, data: contractdata});
      } else {
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      }
    });
  });
});

router.get("/list", (req, res) => {
  ContractorModel.find({is_deleted: false}).sort("company_name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
});

router.get("/view/:id", (req, res) => {
  ContractorModel.findOne({_id: req.params.id, is_deleted: false}).exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json(data);
    }
  });
});

router.get("/processlist/:id", (req, res) => {
  ContractorprocessModel.find({contractor_id: req.params.id, is_deleted: false}).exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data});
    }
  });
});

router.post("/update", (req, res) => {
  ContractorModel.findOne({_id: req.body.contractorForm._id}, (errs, contract) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (contract && contract !== null && contract._id) {
      contract = commonfunction.beforeSave(contract, req);

      contract.profile_picture = req.body.contractorForm.profile_picture;
      contract.company_name = req.body.contractorForm.company_name;
      contract.phone_no = req.body.contractorForm.phone_no;
      contract.email_id = req.body.contractorForm.email_id;
      contract.address1 = req.body.contractorForm.address1;
      contract.address2 = req.body.contractorForm.address2;
      contract.pin_code = req.body.contractorForm.pin_code;
      contract.contact_person = req.body.contractorForm.contact_person;
      contract.mobile_no = req.body.contractorForm.mobile_no;
      contract.contactemail_id = req.body.contractorForm.contactemail_id;
      contract.gstin_number = req.body.contractorForm.gstin_number;
      contract.pan_no = req.body.contractorForm.pan_no;
      contract.is_active = req.body.contractorForm.is_active;

      contract.save((err, contractor) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (contractor && contractor !== null && contractor._id) {
          const obj = {};
          obj.data = contractor;
          obj.data.name = contractor.company_name;
          obj.PAGE = "CONTRACTOR DETAILS";
          obj.PAGENAME = "Contractor details";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Contractor ${contractor.company_name} successfully updated!`});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Contractor details not found"});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  ContractorModel.findOneAndUpdate(query, {$set: {is_deleted: true}}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, message: "successfully deleted!"});
  });
});

router.post("/updatepicture", (req, res) => {
  req.folder = `${global.fupload}contractor_picture`;
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
    const contract = JSON.parse(req.body.data);
    const query = {_id: contract._id};

    ContractorModel.findOneAndUpdate(query, {$set: {profile_picture: req.fileName}}, (errs, contractor) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        return;
      } else if (contractor && contractor !== null && contractor._id) {
        const obj = {};
        obj.data = contractor;
        obj.data.name = contractor.company_name;
        obj.PAGE = "CONTRACTOR DETAILS";
        obj.PAGENAME = "Contractor details";
        const logdata = mastersetuplog.update(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
        return;
      }
      res.send({success: false, message: "Something went wrong. Please try again later!."});
    });
  });
});

// Contractor enable/disable
router.post("/statusupdate", (req, res) => {
  ContractorModel.findOne({_id: req.body._id}, (errs, contract) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (contract && contract !== null && contract._id) {
      contract = commonfunction.beforeSave(contract, req);
      contract.is_active = req.body.is_active;
      let status = "disabled";
      if (contract.is_active) {
        status = "enabled";
      }
      contract.save((err, contractor) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (contractor && contractor !== null && contractor._id) {
          const obj = {};
          obj.data = contractor;
          obj.data.name = contractor.company_name;
          obj.PAGE = "CONTRACTOR DETAILS";
          obj.PAGENAME = "Contractor details";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Contractor ${contractor.company_name} ${status} successfully`});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Contractor details not found"});
    }
  });
});

// Contractor process update
router.post("/updateProcess", (req, res) => {
  if (req.body.processList && req.body.processList !== null && req.body.processList !== "" && req.body.processList.length > 0) {
    ContractorModel.findOne({_id: req.body._id}, (errs, contract) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (contract && contract !== null && contract._id) {
        const processUpdate = [];
        async.mapSeries(req.body.processList, (processDetail, callback) => {
          const obj = {};
          if (processDetail._id) {
            const query = {_id: processDetail._id};
            ContractorprocessModel.findOne(query, (err, processform) => {
              if (err) {
                obj.processDetail = processDetail;
                obj.status = "Failed";
                obj.action = "Update";
                processUpdate.push(obj);
                return callback(errorhelper.getErrorMessage(err), null);
              } else if (processform && processform !== null && processform._id) {
                processform = commonfunction.beforeSave(processform, req);
                processform.process_name = processDetail.process_name;
                processform.subprocess_name = processDetail.subprocess_name;
                processform.is_active = processDetail.is_active;
                processform.is_deleted = processDetail.is_deleted;

                processform.save((errd, prdetail) => {
                  if (errd) {
                    obj.processDetail = processform;
                    obj.status = "Failed";
                    obj.action = "Update";
                    processUpdate.push(obj);
                    return callback(errorhelper.getErrorMessage(errd), null);
                  } else if (prdetail && prdetail !== null && prdetail._id) {
                    obj.processDetail = prdetail;
                    obj.status = "Success";
                    obj.action = "Update";
                    processUpdate.push(obj);
                    callback(null, prdetail);
                  } else {
                    obj.processDetail = processform;
                    obj.status = "Failed";
                    obj.action = "Update";
                    processUpdate.push(obj);
                    return callback("Oops! Something happened please try again later.", null);
                  }
                });
              } else {
                obj.processDetail = processDetail;
                obj.status = "Failed";
                obj.action = "Update";
                processUpdate.push(obj);
                return callback("Oops! Something happened please try again later.", null);
              }
            });
          } else {
            let contractorprocess = new ContractorprocessModel();

            contractorprocess.process_name = processDetail.process_name;
            contractorprocess.subprocess_name = processDetail.subprocess_name;
            contractorprocess.contractor_id = contract._id;
            contractorprocess.is_active = processDetail.is_active;
            // schema before save actions
            contractorprocess = commonfunction.beforeSave(contractorprocess, req);

            contractorprocess.save((errd, prdat) => {
              if (errd) {
                obj.processDetail = processDetail;
                obj.status = "Failed";
                obj.action = "Create";
                processUpdate.push(obj);
                return callback(errorhelper.getErrorMessage(errd), null);
              } else if (prdat && prdat !== null && prdat._id) {
                obj.processDetail = prdat;
                obj.status = "Success";
                obj.action = "Create";
                processUpdate.push(obj);
                callback(null, prdat);
              } else {
                obj.processDetail = processDetail;
                obj.status = "Failed";
                obj.action = "Create";
                processUpdate.push(obj);
                return callback("Oops! Something happened please try again later.", null);
              }
            });
          }
        }, (err, result) => {
          if (err) {
            res.send({success: false, message: err});
          } else {
            if (processUpdate.length > 0) {
              const obj = {};
              obj.data = processUpdate;
              obj.company_name = req.body.name;
              obj.PAGE = "CONTRACTOR PROCESS";
              obj.PURPOSE = "UPDATE";
              const logdata = mastersetuplog.updatecontractorProcess(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }
            }
            res.send({success: true, message: "Stock details has been updated successfully"});
          }
        });
      } else {
        res.send({success: false, message: "Contractor details not found"});
      }
    });
  } else {
    res.send({success: false, message: "Process details not found"});
  }
});

// Fetch customer and order details
router.post("/getContractor", (req, res) => {
  if (req.body.contractor_mobile && req.body.contractor_mobile !== "") {
    const re = new RegExp(req.body.contractor_mobile, "i");

    let select = "company_name phone_no email_id address1 address2 pin_code contactemail_id gstin_number";
    const cond = {is_deleted: false, $or: [{company_name: {$regex: re}}, 
            {$where: `function() { return this.phone_no.toString().match(/${req.body.contractor_mobile}/) !== null; }`}]};
    const query = ContractorModel.find(cond, select);
    query.exec((err, Contractor) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else {
        return res.send({success: true, data: Contractor});
      }
    });
  }
});

module.exports = router;
