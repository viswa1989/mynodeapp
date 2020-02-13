const commonfunction = require("../../../app/middlewares/commonfunction");
const errorhelper = require("../../../app/helpers/errorhelper");
const async = require("async");
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();
const BillModel = require("../../../app/models/BillModel");
const DeliveryModel = require("../../../app/models/DeliveryModel");
// var DeliveryreturnModel = require("app/models/OrderreturnModel");
const PreferenceModel = require("../../../app/models/PreferenceModel");
const OrderModel = require("../../../app/models/OrderModel");
const FabMeasure = require("../../../app/models/FabMeasureModel");
const JobcardstatusModel = require("../../../app/models/JobcardstatusModel");
const SpecialPriceModel = require("../../../app/models/SpecialPriceModel");
const UserModel = require("../../../app/models/UsersModel");
const ActivityModel = require("../../../app/models/ActivityModel");

router.get("/getPendingdues", (req, res) => {
  PreferenceModel.findOne({module: "Dashboard", preference: "Pending Dues"}, "module preference value", (err, preference) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else {
      res.send({success: true, data: preference});
    }
  });
});

router.post("/getPendinginvoice", (req, res) => {
  if (req.body.dueFrom !== null && req.body.dueTo !== null) {
    async.parallel([
      function (callback) { // Fetch invoice details
        const condition = {customer_id: req.session.id, payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};
        req.filters = commonfunction.filterdateBydays(req.body.dueFrom, req.body.dueTo);
        if (req.filters.startDate && req.filters.endDate && req.filters.startDate !== null && req.filters.endDate !== null &&
                        req.filters.startDate !== "" && req.filters.endDate !== "") {
          condition.invoicedue_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
        }

        let select = "division_id invoice_no invoice_date invoicedue_date customer_id customer_name ";
        select += "customer_mobile_no total paid items.order_id items.order_no";
        const query = BillModel.find(condition, select).sort({invoice_date: "desc"});

        query.exec((err, Inv) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Inv);
          }
        });
      },
      function (callback) { // Fetch Total dues
        const select = "total paid";
        const conditions = {customer_id: req.session.id, payment_status: {$ne: "COMPLETED"}, is_deleted: false, is_active: true};

        BillModel.find(conditions, select).exec((err, billTotal) => {
          if (err) {
            callback(err);
          } else {
            callback(null, billTotal);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      const initData = {};
      initData.Pendingdue = results[0] || [];
      initData.Totalpending = results[1] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.post("/getOrder", (req, res) => {
  if (req.session.id && req.session.id !== null && req.session.id !== "" && req.body.limit && req.body.limit !== null &&
    req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const cusid = mongoose.Types.ObjectId(req.session.id);

    const condition = {customer_id: cusid, is_deleted: false, is_active: true};
    if (req.body.filterby !== "ALL") {
      condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
    }
    if (req.body.order_status && req.body.order_status !== "") {
      condition.order_status = req.body.order_status;
    }
    if (req.body.immediate_check !== "") {
      if (req.body.immediate_check) {
        condition.immediate_job = req.body.immediate_check;
      }
    }
    let skipdata = 0;
    let limitdata = 25;
    if (parseInt(req.body.limit) > 0) {
      limitdata = req.body.limit;
    }
    if (req.body.skip && req.body.skip !== null && parseInt(req.body.skip) > 0) {
      skipdata = req.body.skip;
    }

    let select = "order_no division_id customer_name customer_mobile_no order_status order_date inwards immediate_job ";
    select += "customer_dc_no order_reference_no dyeing_dc_no dyeing.dyeing_name";
    const inwsel = "_id inward_no inward_date inward_data.process";

    const query = OrderModel.find(condition, select).populate("inwards", inwsel).sort({ order_date: "desc" }).skip(skipdata)
      .limit(limitdata);
    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
        return;
      }
      return res.send({ success: true, data: orders });
    });
  }
});

router.post("/getOrderstat", (req, res) => {
  if (req.session.id && req.session.id !== null && req.session.id !== "" && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const cusid = mongoose.Types.ObjectId(req.session.id);

    async.parallel([
      function (callback) { // Fetch Division Details
        const condition = { is_deleted: false,
          is_active: true,
          customer_id: cusid,
          is_return: true};
        if (req.body.filterby !== "ALL") {
          condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }
        const matched = {$match: condition};
        const groups = {$group: {_id: "$customer_id", count: {$sum: 1}}};
        DeliveryModel.aggregate(matched, groups, (err, ords) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, ords);
          }
        });
      },
      function (callback) { // Fetch Division Details
        const obj = {is_deleted: false, is_active: true, customer_id: cusid};
        if (req.body.filterby !== "ALL") {
          obj.order_date = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }

        const match = {$match: obj};
        const group = {$group: {_id: "$order_status", count: {$sum: 1}}};
        OrderModel.aggregate(match, group, (err, ords) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, ords);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
        return;
      }

      const initData = {};
      initData.returnOrders = results[0] || [];
      initData.orderCounts = results[1] || [];

      return res.send({ success: true, data: initData });
    });
  }
});

router.post("/getOutward", (req, res) => {
  if (req.session.id && req.session.id !== null && req.session.id !== "" && req.body.limit && req.body.limit !== null &&
    req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const cusid = mongoose.Types.ObjectId(req.session.id);

    const condition = {customer_id: cusid, is_deleted: false, is_active: true};
    if (req.body.filterby !== "ALL") {
      condition.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    }
    let skipdata = 0;
    let limitdata = 25;
    if (parseInt(req.body.limit) > 0) {
      limitdata = req.body.limit;
    }
    if (req.body.skip && req.body.skip !== null && parseInt(req.body.skip) > 0) {
      skipdata = req.body.skip;
    }

    const select = "order_id order_no customer_name customer_mobile_no order_status order_date delivery_no delivery_date outward_data is_return";
    const inwsel = "customer_dc_no order_reference_no dyeing_dc_no";
    DeliveryModel.find(condition, select).populate("order_id", inwsel).sort({delivery_date: "desc"}).skip(skipdata)
      .limit(limitdata)
      .exec((err, orders) => {
        if (err) {
          return res.status(499).send({message: errorhelper.getErrorMessage(err)});
        }
        return res.send({success: true, data: orders});
      });
  }
});

router.post("/getOutwardstat", (req, res) => {
  if (req.session.id && req.session.id !== null && req.session.id !== "" && req.body.limit && req.body.limit !== null &&
    req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const cusid = mongoose.Types.ObjectId(req.session.id);

    const condition = {customer_id: cusid, is_deleted: false, is_active: true};
    if (req.body.filterby !== "ALL") {
      condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
    }
    const matched = {$match: condition};

    const groups = {$group: {_id: {customer_id: "$customer_id", is_return: "$is_return"}, count: {$sum: 1}}};
    const project = {$project: {count: 1, customer_id: "$_id.customer_id", is_return: "$_id.is_return", _id: 0}};
    DeliveryModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: ords});
      }
    });
  }
});

router.get("/viewOrder/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    async.parallel([
      function (callback) { // Fetch order details
        const condition = {_id: req.params.id, customer_id: req.session.id, is_deleted: false, is_active: true};
        let select = "order_no order_serial_no order_date division_id customer_id customer_name customer_mobile_no billing_address_line ";
        select += "billing_area billing_city billing_pincode billing_state contactperson followupPerson order_reference_no customer_dc_no ";
        select += "customer_dc_date dyeing dyeing_dc_no dyeing_dc_date order_status deilvery_status order_type billable received_weight ";
        select += "delivered_weight returned_weight inwards outward_delivery return_delivery labReport labReportsummary";

        let inwardselect = "inward_no inward_serial_no inward_date division_id order_reference_no customer_id customer_name ";
        inwardselect += "customer_mobile_no inward_data total_weight total_delivered_weight total_returned_weight inward_status";

        let outwardselect = "delivery_no delivery_date division_id customer_id customer_name customer_mobile_no billing_address_line ";
        outwardselect += "billing_area billing_city is_return billing_pincode billing_state outward_data delivery_company_name ";
        outwardselect += "delivery_address_line delivery_city delivery_pincode delivery_state vehicle_no driver_name driver_no";

        let outwardreturnselect = "delivery_no delivery_date division_id customer_id customer_name customer_mobile_no ";
        outwardreturnselect += "billing_address_line billing_area billing_city billing_pincode billing_state outward_data is_return";

        const query = OrderModel.findOne(condition, select).populate("inwards", inwardselect)
          .populate("outward_delivery", outwardselect).populate("return_delivery", outwardreturnselect)
          .sort({order_date: "desc"});

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            callback(null, orders);
          }
        });
      },
      function (callback) { // Fetch invoice
        const query = BillModel.findOne({"items.order_id": req.params.id, is_deleted: false, is_active: true});

        query.exec((err, invoice) => {
          if (err) {
            callback(err);
          } else {
            callback(null, invoice);
          }
        });
      },
      function (callback) { // Fetch jobcard status
        const query = UserModel.find({role: {$nin: [1]}, is_deleted: false, is_active: true}, "name mobile_no division");

        query.exec((err, users) => {
          if (err) {
            callback(err);
          } else {
            callback(null, users);
          }
        });
      },
      function (callback) { // Fetch jobcard status
        const query = JobcardstatusModel.find({}, "color name");

        query.exec((err, fabtype) => {
          if (err) {
            callback(err);
          } else {
            callback(null, fabtype);
          }
        });
      },
      function (callback) { // Fetch measurement units
        const query = FabMeasure.find({}, "_id fabric_measure");

        query.exec((err, fabmeasure) => {
          if (err) {
            callback(err);
          } else {
            callback(null, fabmeasure);
          }
        });
      },
      function (callback) { // Fetch special price for order
        const sel = "order_id division_id customer_id process_id measurement_id qty price";
        const query = SpecialPriceModel.find({order_id: req.params.id, customer_id: req.session.id}, sel);

        query.exec((err, prices) => {
          if (err) {
            callback(err);
          } else {
            callback(null, prices);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (results === null || results[0] === null) {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }

      const initData = {};
      initData.Orders = results[0] || [];
      initData.Invoice = results[1] || [];
      initData.Users = results[2] || [];
      initData.order_status = results[3] || [];
      initData.measurement = results[4] || [];
      initData.specialPrice = results[5] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/viewLabreport/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, is_deleted: false, is_active: true};
    const select = "labReport labReportsummary";
    const query = OrderModel.findOne(condition, select);

    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: orders});
      }
    });
  }
});

router.get("/viewActivity/:id", (req, res) => {
  if (req.params.id && req.params.id !== null) {
    const id = mongoose.Types.ObjectId(req.params.id);
    const condition = {$or: [{"data._id": id}, {"data.order_id": id}, {"data.items.order_id": id}]};
    const select = "MENU PAGE created data division_name linkid message";

    ActivityModel.find(condition, select).sort({created: -1}).exec((err, activity) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: activity});
    });
  }
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

module.exports = router;
