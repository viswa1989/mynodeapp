const commonfunction = require("../../../app/middlewares/commonfunction");
const errorhelper = require("../../../app/helpers/errorhelper");
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();
const ActivityModel = require("../../../app/models/ActivityModel");

router.get("/getNotification/:category/:period/:skip", (req, res) => {
  const condition = {};
  let skiplist = 0;
  if (req.params.period && req.params.period !== null && req.params.period !== "" && req.params.period !== "ALL") {
    req.filters = commonfunction.filterdateBycategory(req.params.period);
    if (req.filters.startDate && req.filters.endDate && req.filters.startDate !== null && req.filters.endDate !== null &&
                req.filters.startDate !== "" && req.filters.endDate !== "") {
      condition.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    }
  }
  if(req.session.branch && req.session.branch !== null){
    condition.$or = [{"division": req.session.branch}, {"data.division_id": req.session.branch}];
  }
  if (req.params.skip && req.params.skip !== "" && req.params.skip !== null && parseInt(req.params.skip) > 0) {
    skiplist = parseInt(req.params.skip);
  }
  const query = ActivityModel.find(condition, "created division_name message").sort({created: -1}).skip(skiplist).limit(25)
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
    const select = "created division_name message";

    ActivityModel.find(condition, select).sort({created: -1}).exec((err, activity) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: activity});
    });
  }
});

module.exports = router;
