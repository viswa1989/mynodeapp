const auth = require("../../../app/middlewares/auth");
const express = require("express");

const router = express.Router();
const InwardModel = require("../../../app/models/InwardModel");
const errorhelper = require("../../../app/helpers/errorhelper");

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `inwards ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/getInward/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {inward_status: "New", is_deleted: false, is_active: true};
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      condition.division_id = req.session.branch;
    } else {
      condition.division_id = req.params.id;
    }
    const select = "inward_no customer_name customer_mobile_no inward_status inward_date";
    const query = InwardModel.find(condition, select).sort({inward_date: "desc"});
    query.exec((err, inwards) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: inwards});
    });
  }
});

router.get("/viewInward/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, order_id: {$exists: false}, is_deleted: false, is_active: true};

    let select = "inward_no order_reference_no customer_dc_no customer_dc_date customer_id customer_name customer_mobile_no ";
    select += "inward_data billing_address_line billing_area billing_city billing_pincode billing_state inward_status inward_date";
    const query = InwardModel.findOne(condition, select);
    query.exec((err, inwards) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else if (inwards && inwards !== null && inwards._id) {
        return res.send({success: true, data: inwards});
      }
      return res.send({success: false, data: inwards});
    });
  }
});

module.exports = router;
