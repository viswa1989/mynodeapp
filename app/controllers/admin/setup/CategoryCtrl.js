const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const CategoryModel = require("../../../../app/models/CategorysModel");

function categoryList(req, res) {
  CategoryModel.find({is_deleted: false}).sort("name").exec((err, data) => {
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
    req.caction = `categorys ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", categoryList);

router.get("/getCategory", (req, res) => {
  CategoryModel.find({is_deleted: false}).sort("name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

router.get("/getCategorydetailsById/:id", (req, res) => {
  CategoryModel.findOne({_id: req.params.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    } else if (data && data !== null && data._id) {
      const categoryData = {};
      categoryData.Category = data;
      res.json({success: true, data: categoryData});
      return;
    }
    return res.send({success: false, message: "Something went wrong please try again later!."});
  });
});

router.get("/me", (req, res) => {
  CategoryModel.find({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

// save the categorys
router.post("/create", (req, res) => {
  let newCategory = new CategoryModel({
    name: req.body.categoryForm.name,
    code: req.body.categoryForm.code,
    is_active: req.body.categoryForm.is_active,
  });
  newCategory = commonfunction.beforeSave(newCategory, req);

  newCategory.save((err, Category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (Category && Category !== null && Category._id) {
      const obj = {};
      obj.data = Category;
      obj.PAGE = "CATEGORY";
      obj.PAGENAME = "Purchase category";
      const logdata = mastersetuplog.create(obj, req);
      if (logdata.message && logdata.message !== null) {
        notificationlog.savelog(logdata, res);
      }
      res.send({success: true, message: "category added successfully!.", data: Category});
    } else {
      res.send({success: false, message: "Something went wrong. Please try again later!."});
    }
  });
});

router.post("/update", (req, res) => {
  CategoryModel.findOne({_id: req.body.categoryForm._id}, (err, category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (category && category !== null && category._id) {
      // schema before save actions
      category = commonfunction.beforeSave(category, req);
      category.name = req.body.categoryForm.name;
      category.code = req.body.categoryForm.code;
      category.is_active = req.body.categoryForm.is_active;
      category.is_deleted = req.body.categoryForm.is_deleted;

      category.save((errs, parCategory) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (parCategory && parCategory !== null && parCategory._id) {
          const obj = {};
          obj.data = parCategory;
          obj.PAGE = "CATEGORY";
          obj.PAGENAME = "Purchase category";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          res.send({success: true, message: `${parCategory.name} successfully updated!`, data: parCategory});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Category not found"});
    }
  });
});

router.post("/updatestatus", (req, res) => {
  CategoryModel.findOne({_id: req.body.id}, (err, category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (category && category !== null && category._id) {
      // schema before save actions
      category = commonfunction.beforeSave(category, req);
      category.is_active = req.body.is_active;

      category.save((errs, categorys) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        } else if (categorys && categorys !== null && categorys._id) {
          const obj = {};
          obj.data = categorys;
          obj.PAGE = "CATEGORY";
          obj.PAGENAME = "Purchase category";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: "Category successfully updated!", data: categorys});
        } else {
          res.send({success: false, message: "Something went wrong. Please try again later!."});
        }
      });
    } else {
      res.send({success: false, message: "Category not found"});
    }
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  CategoryModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, message: "Category successfully deleted!"});
    }
  });
});

// vendor enable/disable
router.post("/statusupdate", (req, res) => {
  CategoryModel.findOne({_id: req.body._id}, (errs, category) => {
    if (errs) {
      res.status(499).send({message: errorhelper.getErrorMessage(errs)});
    } else if (category && category !== null && category._id) {
      category = commonfunction.beforeSave(category, req);
      category.is_active = req.body.is_active;
      let status = "disabled";
      if (category.is_active) {
        status = "enabled";
      }
      category.save((err, categorys) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (categorys && categorys !== null && categorys._id) {
          const obj = {};
          obj.data = categorys;
          obj.PAGE = "CATEGORY";
          obj.PAGENAME = "Purchase category";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Category ${categorys.name} ${status} successfully`});
          return;
        }
        res.send({success: false, message: "Something went wrong. Please try again later!."});
      });
    } else {
      res.send({success: false, message: "Category details not found"});
    }
  });
});

module.exports = router;
