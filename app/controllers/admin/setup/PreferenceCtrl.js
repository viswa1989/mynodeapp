const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const async = require("async");
const express = require("express");

const router = express.Router();
const PreferenceModel = require("../../../../app/models/PreferenceModel");

function List(req, res) {
  PreferenceModel.find({ is_deleted: false }, (err, data) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.send({ success: true, data });
  });
}

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `complaintcode ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", List);

// save the customer group
router.post("/create", (req, res) => {
  let newpreference = new PreferenceModel({
    module: req.body.preferenceForm.module,
    preference: req.body.preferenceForm.preference,
    value: req.body.preferenceForm.value,
  });
  newpreference = commonfunction.beforeSave(newpreference, req);

  newpreference.save((err, newPreferences) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    } else if (newPreferences && newPreferences !== null && newPreferences._id) {
      res.send({ success: true, message: "Preference successfully created!", data: newPreferences });
      return;
    }
    return res.send({ success: false, message: "Something went wrong please try again later!." });
  });
});

router.post("/update", (req, res) => {
  PreferenceModel.findOne({ _id: req.body.preferenceForm._id }, (err, preference) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
    } else if (preference && preference !== null && preference._id) {
      // schema before save actions
      preference = commonfunction.beforeSave(preference, req);
      preference.module = req.body.preferenceForm.module;
      preference.preference = req.body.preferenceForm.preference;
      preference.value = req.body.preferenceForm.value;

      preference.save((errs, preferences) => {
        if (errs) {
          res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
          return;
        } else if (preferences && preferences !== null && preferences._id) {
          res.send({ success: true, message: "Preference successfully updated!", data: preferences });
          return;
        }
        return res.send({ success: false, message: "Something went wrong please try again later!." });
      });
    } else {
      return res.send({ success: false, message: "Preference data not found" });
    }
  });
});

router.post("/updatestatus", (req, res) => {
  PreferenceModel.findOne({ _id: req.body.id }, (err, preference) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
    } else if (preference && preference !== null && preference._id) {
      // schema before save actions
      preference = commonfunction.beforeSave(preference, req);
      preference._id = req.body.id;
      preference.is_active = req.body.is_active;

      preference.save((errs, complaints) => {
        if (errs) {
          res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
          return;
        } else if (complaints && complaints !== null && complaints._id) {
          res.send({ success: true, message: "Preference successfully updated!", data: complaints });
          return;
        }
        return res.send({ success: false, message: "Something went wrong please try again later!." });
      });
    } else {
      return res.send({ success: false, message: "Preference data not found" });
    }
  });
});

router.post("/delete", (req, res) => {
  const query = { _id: req.body.id };

  PreferenceModel.findOneAndUpdate(query, { $set: { is_deleted: true } }, (err) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.send({ success: true, message: "successfully deleted!" });
  });
});

router.get("/view/:id", (req, res) => {
  PreferenceModel.find({ _id: req.params.id }, (err, data) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.json(data);
  });
});

function asyncValidatepreference(preferenceform, req, callback) {
  async.each(preferenceform, (preference, callbk) => {
    if (preference._id) {
      PreferenceModel.findOne({ _id: preference._id }, (err, preferenceData) => {
        if (err) {
          callbk(err);
        } else {
          // schema before save actions
          preferenceData = commonfunction.beforeSave(preferenceData, req);
          preferenceData.module = preference.module;
          preferenceData.preference = preference.preference;
          preferenceData.value = preference.value;

          preferenceData.validate((validerr) => {
            if (validerr) {
              callbk(err);
            } else {
              callbk(null, preferenceData);
            }
          });
        }
      });
    } else {
      let newpreference = new PreferenceModel({
        module: preference.module,
        preference: preference.preference,
        value: preference.value,
      });
      newpreference = commonfunction.beforeSave(newpreference, req);

      newpreference.validate((validerr) => {
        if (validerr) {
          callbk(validerr);
        } else {
          callbk(null, newpreference);
        }
      });
    }
  }, (err) => {
    if (err) { callback(err); } else { callback(null); }
  });
}

function asyncUpdatepreference(preferenceform, req, callback) {
  async.each(preferenceform, (preference, callbk) => {
    if (preference._id) {
      PreferenceModel.findOne({ _id: preference._id }, (err, preferenceData) => {
        if (err) {
          callbk(err);
          return;
        }
        // schema before save actions
        preferenceData = commonfunction.beforeSave(preferenceData, req);
        preferenceData.module = preference.module;
        preferenceData.preference = preference.preference;
        preferenceData.value = preference.value;

        preferenceData.save((validerr, prefData) => {
          if (validerr) {
            callbk(err);
          } else {
            callbk(null, prefData);
          }
        });
      });
    } else {
      let newpreference = new PreferenceModel({
        module: preference.module,
        preference: preference.preference,
        value: preference.value,
      });
      newpreference = commonfunction.beforeSave(newpreference, req);

      newpreference.save((validerr, newpref) => {
        if (validerr) {
          callbk(validerr);
        } else {
          callbk(null, newpref);
        }
      });
    }
  }, (err) => {
    if (err) { callback(err); } else { callback(null); }
  });
}

router.post("/updatePreferencelist", (req, res) => {
  if (!req.body.preferencePassword || req.body.preferencePassword === null || req.body.preferencePassword === "") {
    res.send({ success: false, message: "Please enter the developer password to update prefernces." });
    return;
  }

  if (req.body.preferencePassword === "probe7Dev") {
    if (req.body.preferenceForm && req.body.preferenceForm !== null && req.body.preferenceForm !== "" && req.body.preferenceForm.length > 0) {
      asyncValidatepreference(req.body.preferenceForm, req, (err) => {
        if (err) {
          res.status(499).send({ message: errorhelper.getErrorMessage(err) });
          return;
        }

        asyncUpdatepreference(req.body.preferenceForm, req, (errs) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          }
          res.send({ success: true, message: "Preferences successfully updated." });
        });
      });
    } else {
      res.send({ success: false, message: "Preferences is empty you can't update." });
    }
  } else {
    res.send({ success: false, message: "The password you entered is incorrect. Please enter the correct passwor to update" });
  }
});

router.get("/getPendingdues", (req, res) => {
  PreferenceModel.findOne({ module: "Dashboard", preference: "Pending Dues", is_deleted: false }, "module preference value", (err, preference) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.send({ success: true, data: preference });
  });
});

function getAgeingheader(duedata, callback) {
    let overallDues = [];
    for (let i = 0; i < duedata.length; i += 1) {
      let obj = duedata[i];
      if (i < duedata.length-1) {
        obj += "To"+duedata[i+1];
      } else {
        obj = "Above"+duedata[i];
      }
      overallDues.push(obj);
    }
    callback(null, overallDues);
}

router.get("/getPendingduelist", (req, res) => {
  PreferenceModel.findOne({ module: "Dashboard", preference: "Pending Dues", is_deleted: false }, "value", (err, preference) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    } else if (preference && preference !== null && preference.value && preference.value !== null && preference.value !== "") {
      let prefvalue = preference.value.split(",");
      if (prefvalue && prefvalue !== null && prefvalue.length>0) {
        pendingpref = prefvalue;
        getAgeingheader(pendingpref, (errs, rdata) => {
          if (rdata !== null && rdata.length>0) {
            res.send({ success: true, data: rdata });
          } else {
            res.send({ success: true, data: [] });
          }
        });
      }
    } else {
      res.send({ success: true, data: [] });
    }
  });
});

router.get("/getdateFormats", (req, res) => {
  PreferenceModel.find({ module: "date_format", is_deleted: false }, (err, data) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.send({ success: true, data });
  });
});

router.get("/getweightdifference", (req, res) => {
  PreferenceModel.findOne({ module: "Delivery", preference: "weight_difference_percentage", is_deleted: false }, (err, data) => {
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }
    res.send({ success: true, data });
  });
});

module.exports = router;
