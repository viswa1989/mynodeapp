const auth = require("../../../app/middlewares/auth");
const commonfunction = require("../../../app/middlewares/commonfunction");
const errorhelper = require("../../../app/helpers/errorhelper");
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();
const ActivityModel = require("../../../app/models/ActivityModel");

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `items ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.get("/getNotification/:category/:period/:skip/:limit", (req, res) => {
  const condition = {};
  if (req.params.category && req.params.category !== null && req.params.category !== "" && req.params.category !== "ALL") {
    condition.MENU = req.params.category;
  }
  if (req.params.period && req.params.period !== null && req.params.period !== "" && req.params.period !== "ALL") {
    req.filters = commonfunction.filterdateBycategory(req.params.period);
    if (req.filters.startDate && req.filters.endDate && req.filters.startDate !== null && req.filters.endDate !== null &&
                req.filters.startDate !== "" && req.filters.endDate !== "") {
      condition.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    }
  }
  if (req.session.branch && req.session.branch !== null) {
    condition.$or = [{division: req.session.branch}, {"data.division_id": req.session.branch}];
  }
  const query = ActivityModel.find(condition).sort({created: -1}).skip(parseInt(req.params.skip)).limit(parseInt(req.params.limit))
    .lean();

  query.exec((err, activity) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    } else if (activity && activity !== null && activity.length >= 0) {
      res.send({success: true, data: activity});
      return;
    }
    res.send({success: false, message: "No data found"});
  });
});

router.get("/viewActivity/:id", (req, res) => {
  if (req.params.id && req.params.id !== null) {
    const id = mongoose.Types.ObjectId(req.params.id);
    const condition = {$or: [{"data._id": id}, {"data.order_id": id}, {"data.items.order_id": id}]};
    const select = "MENU PAGE created data division_name linkid message";

    ActivityModel.find(condition, select).sort({created: -1}).exec((err, activity) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: activity});
      }
    });
  }
});

module.exports = router;
