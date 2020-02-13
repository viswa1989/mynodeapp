const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const mastersetuplog = require("../../../../app/middlewares/mastersetuplog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const express = require("express");

const router = express.Router();
const ProductModel = require("../../../../app/models/ProductsModel");
const fileUpload = require("../../../../app/helpers/fileUploader");

function productList(req, res) {
  ProductModel.find({is_deleted: false}).sort("name").exec((err, data) => {
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
    req.caction = `products ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/list", productList);

router.get("/me", (req, res) => {
  ProductModel.find({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.json(data);
    }
  });
});

// save the product
router.post("/create", (req, res) => {
  req.folder = `${global.fupload}product_picture`;
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
    } else {
      const product = JSON.parse(req.body.data);

      let newBrand = new ProductModel({
        product_name: product.product_name,
        product_code: product.product_code,
        category_id: product.category_id,
        description: product.description,
        product_picture: req.fileName,
        minimum_stock: parseInt(product.minimum_stock),
        maximum_stock: parseInt(product.maximum_stock),
        is_active: product.is_active,
      });
      // schema before save actions
      newBrand = commonfunction.beforeSave(newBrand, req);

      newBrand.save((errs, newProducts) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        } else if (newProducts && newProducts !== null && newProducts._id) {
          const obj = {};
          obj.data = newProducts;
          obj.data.name = newProducts.product_name;
          obj.PAGE = "PRODUCT";
          obj.PAGENAME = "Products";
          const logdata = mastersetuplog.create(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Product ${product.product_name} successfully created!`, data: newProducts});
        } else {
          return res.send({success: false, message: "Something went wrong please try again later!."});
        }
      });
    }
  });
});

router.post("/update", (req, res) => {
  ProductModel.findOne({_id: req.body.productForm._id}, (err, product) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (product && product !== null && product._id) {
      // schema before save actions
      product = commonfunction.beforeSave(product, req);
      product.product_name = req.body.productForm.product_name;
      product.product_code = req.body.productForm.product_code;
      product.category_id = req.body.productForm.category_id;
      product.description = req.body.productForm.description;
      product.minimum_stock = req.body.productForm.minimum_stock;
      product.maximum_stock = req.body.productForm.maximum_stock;
      product.maximum_stock = req.body.productForm.maximum_stock;
      product.is_active = req.body.productForm.is_active;

      product.save((errs, productdetail) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        } else if (productdetail && productdetail !== null && productdetail._id) {
          const obj = {};
          obj.data = productdetail;
          obj.data.name = productdetail.product_name;
          obj.PAGE = "PRODUCT";
          obj.PAGENAME = "Products";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Product ${productdetail.product_name} successfully updated!`, data: productdetail});
        } else {
          return res.send({success: false, message: "Something went wrong please try again later!."});
        }
      });
    } else {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }
  });
});

router.post("/update_picture", (req, res) => {
  req.folder = `${global.fupload}product_picture`;
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
    const product = JSON.parse(req.body.data);
    const query = {_id: product._id};

    ProductModel.findOneAndUpdate(query, {$set: {product_picture: req.fileName}}, (errs, productdetail) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (productdetail && productdetail !== null && productdetail._id) {
        const obj = {};
        obj.data = productdetail;
        obj.data.name = productdetail.product_name;
        obj.PAGE = "PRODUCT";
        obj.PAGENAME = "Products";
        const logdata = mastersetuplog.update(obj, req);
        if (logdata.message && logdata.message !== null) {
          notificationlog.savelog(logdata, res);
        }

        res.send({success: true, message: "File uploaded successfully", filename: req.fileName});
      } else {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }
    });
  });
});

router.post("/delete", (req, res) => {
  const query = {_id: req.body._id};
  ProductModel.findOneAndUpdate(query, {$set: {is_deleted: req.body.is_deleted}}, (err, productdetail) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (productdetail && productdetail !== null && productdetail._id) {
      res.send({success: true, message: `Product ${productdetail.name} successfully deleted!`});
    } else {
      res.send({success: false, message: "Product not found"});
    }
  });
});

router.get("/view/:id", (req, res) => {
  ProductModel.findOne({_id: req.params.id}).exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.json(data);
  });
});

router.post("/getproductbyids", (req, res) => {
  ProductModel.find({category_id: req.body.category_id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (data) {
      res.send({success: true, data});
    }
  });
});

router.get("/checkProductexist/:id", (req, res) => {
  const regex = new RegExp(`^${req.params.id}$`, "i");
  const query = ProductModel.find({product_name: regex, is_deleted: false, is_active: true}).sort({created: -1}).limit(8);

  query.exec((err, category) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data: category});
    }
  });
});

router.post("/getProductsautocomplete", (req, res) => {
  if (req.body.term && req.body.term !== "") {
    const regex = new RegExp(req.body.term, "i");
    const query = ProductModel.find({product_name: regex, is_deleted: false, is_active: true}, "_id product_name category_id")
      .sort({created: -1}).limit(8);
    query.exec((err, products) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      res.send({success: true, data: products});
    });
  }
});

router.post("/statusupdate", (req, res) => {
  ProductModel.findOne({_id: req.body._id}, (err, product) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (product && product !== null && product._id) {
      // schema before save actions
      product = commonfunction.beforeSave(product, req);
      product.is_active = req.body.is_active;
      let status = "disabled";
      if (product.is_active) {
        status = "enabled";
      }
      product.save((errs, productdetail) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (productdetail && productdetail !== null && productdetail._id) {
          const obj = {};
          obj.data = productdetail;
          obj.data.name = productdetail.product_name;
          obj.PAGE = "PRODUCT";
          obj.PAGENAME = "Products";
          const logdata = mastersetuplog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `Product ${productdetail.product_name} ${status} successfully`});
          return;
        }
        return res.send({success: false, message: "Something went wrong please try again later!."});
      });
    } else {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }
  });
});

module.exports = router;
