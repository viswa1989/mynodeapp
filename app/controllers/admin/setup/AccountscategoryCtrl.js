const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const accountspayrolllog = require("../../../../app/middlewares/accountspayrolllog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const async = require("async");
const AccountscategoryModel = require("../../../../app/models/AccountscategoryModel");

function categoryList(req, res) { /** FUNCTIONS * */
  AccountscategoryModel.find({}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
}

router.use((req, res, next) => { // Controller constructor
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `accountscategory ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", categoryList);

router.post("/update", (req, res) => {
  const categorytype = req.body.typesOfCategories;

  async.mapSeries(req.body.treeGrid, (accCategory, callback) => {
    if (accCategory._id && accCategory._id !== "") {
      AccountscategoryModel.findOne({_id: accCategory._id}, (errs, accCategorydata) => {
        if (errs) {
          callback(errs, null);
        } else if (accCategorydata && accCategorydata !== null && accCategorydata._id) {
          // schema before save actions
          accCategorydata = commonfunction.beforeSave(accCategorydata, req);
          accCategorydata.DemographicId = accCategory.DemographicId;
          accCategorydata.DEFAULT = accCategory.DEFAULT;
          accCategorydata.ParentId = accCategory.ParentId;
          accCategorydata.category_name = accCategory.category_name;
          accCategorydata.category_unique = accCategory.category_unique;
          accCategorydata.category_id = accCategory.category_id;
          accCategorydata.groupname = accCategory.groupname;
          accCategorydata.groupIndex = accCategory.groupIndex;
          accCategorydata.groupunique = accCategory.groupunique;
          accCategorydata.level = accCategory.level;
          accCategorydata.uid = accCategory.uid;
          accCategorydata.parent_uid = accCategory.parent_uid;
          accCategorydata.nodeDisabled = accCategory.nodeDisabled;
          accCategorydata.categoryType = categorytype;

          accCategorydata.save((err, acccategory) => {
            if (err) {
              callback(err, null);
            } else if (acccategory && acccategory !== null && acccategory._id) {
              req.executedstatement = accCategory;
              callback(null, req.executedstatement);
            } else {
              req.executedstatement = accCategory;
              callback(null, req.executedstatement);
            }
          });
        }
      });
    } else {
      let accCategorydata = new AccountscategoryModel();
      // schema before save actions
      accCategorydata = commonfunction.beforeSave(accCategorydata, req);

      accCategorydata.DemographicId = accCategory.DemographicId;
      accCategorydata.DEFAULT = accCategory.DEFAULT;
      accCategorydata.ParentId = accCategory.ParentId;
      accCategorydata.category_name = accCategory.category_name;
      accCategorydata.category_unique = accCategory.category_unique;
      accCategorydata.category_id = accCategory.category_id;
      accCategorydata.groupname = accCategory.groupname;
      accCategorydata.groupIndex = accCategory.groupIndex;
      accCategorydata.groupunique = accCategory.groupunique;
      accCategorydata.level = accCategory.level;
      accCategorydata.uid = accCategory.uid;
      accCategorydata.parent_uid = accCategory.parent_uid;
      accCategorydata.nodeDisabled = accCategory.nodeDisabled;
      accCategorydata.categoryType = categorytype;

      accCategorydata.save((errs, acccategory) => {
        if (errs) {
          callback(errs, null);
        } else if (acccategory && acccategory !== null && acccategory._id) {
          req.executedstatement = accCategory;
          callback(null, req.executedstatement);
        } else {
          req.executedstatement = accCategory;
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
    obj.PAGE = "ACCOUNTS CATEGORY";
    obj.PAGENAME = req.body.typesOfCategories === "INCOMING" ? "income" : "expense";
    const logdata = accountspayrolllog.updateCategory(obj, req);
    if (logdata.message && logdata.message !== null) {
      notificationlog.savelog(logdata, res);
    }

    res.json({success: true, message: "Accounts category updated successfully"});
  });
});

module.exports = router;
