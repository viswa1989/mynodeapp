const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const outwardpagelog = require("../../../../app/middlewares/outwardpagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const OrderModel = require("../../../../app/models/OrderModel");
const DeliveryModel = require("../../../../app/models/DeliveryModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const ProcessModel = require("../../../../app/models/ProcessModel");
const SpecialPriceModel = require("../../../../app/models/SpecialPriceModel");
const VehicledetailModel = require("../../../../app/models/VehicledetailModel");
const DriverdetailModel = require("../../../../app/models/DriverdetailModel");
const mongoose = require("mongoose");

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

router.get("/getProcess", (req, res) => {
  ProcessModel.find({is_deleted: false, division_id: req.session.branch}, "process_name").exec((err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data});
  });
});

router.post("/save", (req, res) => {
  if (req.body.deliveryForm) {
    if (!req.body.deliveryForm.outwardData || req.body.deliveryForm.outwardData === null || req.body.deliveryForm.outwardData === "" ||
    req.body.deliveryForm.outwardData.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    if (req.body.deliveryForm.order_id && req.body.deliveryForm.order_id !== null && req.body.deliveryForm.order_id !== "") {
      OrderModel.findOne({_id: req.body.deliveryForm.order_id}).populate("inwards").exec((err, order) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (order && order !== null && order._id) {
          if (order.inwards && order.inwards !== null && order.inwards.length > 0) {
            DivisionaccountModel.findOne({division_id: req.session.branch}, "division_id outward").exec((diverr, Divisionaccount) => {
              if (diverr) {
                res.status(499).send({message: errorhelper.getErrorMessage(diverr)});
              } else if (Divisionaccount && Divisionaccount !== null && Divisionaccount._id && Divisionaccount._id !== "" &&
              Divisionaccount.outward && Divisionaccount.outward.prefix && Divisionaccount.outward.serial_no &&
              Divisionaccount.outward.prefix !== "" && Divisionaccount.outward.serial_no !== "") {
                let newDelivery = new DeliveryModel({
                  delivery_no: `${Divisionaccount.outward.prefix}${Divisionaccount.outward.serial_no}`,
                  delivery_serial_no: Divisionaccount.outward.serial_no,
                  order_no: req.body.deliveryForm.order_no,
                  order_id: req.body.deliveryForm.order_id,
                  order_date: req.body.deliveryForm.order_date,
                  division_id: req.session.branch,
                  customer_id: req.body.deliveryForm.customer_id,
                  customer_name: req.body.deliveryForm.customer_name,
                  customer_mobile_no: req.body.deliveryForm.customer_mobile_no,
                  billing_company_name: req.body.deliveryForm.billing_company_name,
                  billing_gstin: req.body.deliveryForm.billing_gstin,
                  billing_address_line: req.body.deliveryForm.billing_address_line,
                  billing_area: req.body.deliveryForm.billing_area,
                  billing_city: req.body.deliveryForm.billing_city,
                  billing_pincode: req.body.deliveryForm.billing_pincode,
                  billing_state: req.body.deliveryForm.billing_state,
                  delivery_company_name: req.body.deliveryForm.delivery_company_name,
                  delivery_address_line: req.body.deliveryForm.delivery_address_line,
                  delivery_city: req.body.deliveryForm.delivery_city,
                  delivery_pincode: req.body.deliveryForm.delivery_pincode,
                  delivery_state: req.body.deliveryForm.delivery_state,
                  vehicle_no: req.body.deliveryForm.vehicle_no,
                  driver_name: req.body.deliveryForm.driver_name,
                  driver_no: req.body.deliveryForm.driver_no,
                  order_type: req.body.deliveryForm.order_type,
                  outward_data: req.body.deliveryForm.outwardData,
                  is_return: false,
                });
                newDelivery = commonfunction.beforeSave(newDelivery, req);

                newDelivery.save((outwarderr, outwards) => {
                  if (outwarderr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
                  } else if (outwards && outwards !== null && outwards._id) {
                    const brquery = {division_id: Divisionaccount.division_id};
                    const vquery = {vehicle_no: req.body.deliveryForm.vehicle_no};
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    const driquery = {driver_name: req.body.deliveryForm.driver_name};
                    const updatedri = { driver_name: req.body.deliveryForm.driver_name, driver_no: req.body.deliveryForm.driver_no };

                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"outward.serial_no": 1}}, (brerr, bdata) => {
                      if (brerr) {
                        res.status(499).send({message: errorhelper.getErrorMessage(brerr)});
                      } else if (bdata && bdata !== null && bdata._id) {
                        order.outward_delivery.push(outwards._id);
                        OrderModel.findOneAndUpdate({_id: order._id}, order, (ordererr, order) => {
                          //                                                order.save(function (ordererr, order) {
                          if (ordererr) {
                            DeliveryModel.findByIdAndRemove(outwards._id, (errrem) => { });
                            res.status(499).send({message: errorhelper.getErrorMessage(ordererr)});
                            return;
                          } else if (order && order !== null && order._id) {
                            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});

                            const obj = {};
                            obj.data = order;
                            obj.data.delivery_no = outwards.delivery_no;
                            obj.PAGE = "DELIVERY OUTWARD";
                            const logdata = outwardpagelog.saveOutwarddelivery(obj, req);
                            if (logdata.message && logdata.message !== null) {
                              notificationlog.savelog(logdata, res);
                            }

                            return res.send({success: true, data: outwards});
                          }
                          DeliveryModel.findByIdAndRemove(outwards._id, (errrem) => { });
                          return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                        });
                      } else {
                        DeliveryModel.findByIdAndRemove(outwards._id, (errrem) => { });
                        return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                      }
                    });
                  } else {
                    return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                  }
                });
              } else {
                return res.send({success: false, message: "Delivery prefix & serial no not found"});
              }
            });
          } else {
            return res.send({success: false, message: "Inwards not found"});
          }
        } else {
          return res.send({success: false, message: "Order not found"});
        }
      });
    }
  }
});

router.post("/update", (req, res) => {
  if (req.body.deliveryForm && req.body.deliveryForm._id) {
    if (!req.body.deliveryForm.outward_data || req.body.deliveryForm.outward_data === null || req.body.deliveryForm.outward_data === "" ||
    req.body.deliveryForm.outward_data.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    
    DeliveryModel.findOne({_id: req.body.deliveryForm._id}).exec((err, deliverydata) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (deliverydata && deliverydata !== null && deliverydata._id) {
        
        deliverydata.billing_company_name = req.body.deliveryForm.billing_company_name;
        deliverydata.billing_gstin = req.body.deliveryForm.billing_gstin;
        deliverydata.billing_address_line = req.body.deliveryForm.billing_address_line;
        deliverydata.billing_area = req.body.deliveryForm.billing_area;
        deliverydata.billing_city = req.body.deliveryForm.billing_city;
        deliverydata.billing_pincode = req.body.deliveryForm.billing_pincode;
        deliverydata.billing_state = req.body.deliveryForm.billing_state;
        deliverydata.delivery_company_name = req.body.deliveryForm.delivery_company_name;
        deliverydata.delivery_address_line = req.body.deliveryForm.delivery_address_line;
        deliverydata.delivery_city = req.body.deliveryForm.delivery_city;
        deliverydata.delivery_pincode = req.body.deliveryForm.delivery_pincode;
        deliverydata.delivery_state = req.body.deliveryForm.delivery_state;
        deliverydata.vehicle_no = req.body.deliveryForm.vehicle_no;
        deliverydata.driver_name = req.body.deliveryForm.driver_name;
        deliverydata.driver_no = req.body.deliveryForm.driver_no;
        deliverydata.outward_data = req.body.deliveryForm.outward_data;
        
        deliverydata = commonfunction.beforeSave(deliverydata, req);

        deliverydata.save((outwarderr, outwards) => {
          if (outwarderr) {
            res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
          } else if (outwards && outwards !== null && outwards._id) {
            const brquery = {division_id: deliverydata.division_id};
            const vquery = {vehicle_no: req.body.deliveryForm.vehicle_no};
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            const driquery = {driver_name: req.body.deliveryForm.driver_name};
            const updatedri = { driver_name: req.body.deliveryForm.driver_name, driver_no: req.body.deliveryForm.driver_no };
            
            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});
            
            const obj = {};
            obj.data = outwards;
            obj.PAGE = "DELIVERY OUTWARD";
            const logdata = outwardpagelog.updateOutwarddelivery(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({success: true, data: outwards});            
          } else {
            return res.send({success: false, message: "Oops! something went wrong please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Order not found"});
      }
    });
  }
});

router.post("/getOutward", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.limit && req.body.limit !== null && req.body.filterby &&
    req.body.filterby !== null) {
    const condition = {is_deleted: false, is_active: true};
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
      condition.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    }

    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      condition.division_id = mongoose.Types.ObjectId(req.session.branch);
    } else if (req.body.divisionID !== "All") {
      condition.division_id = mongoose.Types.ObjectId(req.body.divisionID);
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
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }
        return res.send({success: true, data: orders});
      });
  }
});

router.post("/getOutwardstatbydivision", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.limit && req.body.limit !== null && req.body.filterby &&
    req.body.filterby !== null) {
    const condition = {is_deleted: false, is_active: true};
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
      condition.created = {$gte: req.filters.startDate, $lte: req.filters.endDate};
    }

    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      condition.division_id = mongoose.Types.ObjectId(req.session.branch);
    } else if (req.body.divisionID !== "All") {
      condition.division_id = mongoose.Types.ObjectId(req.body.divisionID);
    }

    const matched = {$match: condition};
    const groups = {$group: {_id: {division_id: "$division_id", is_return: "$is_return"}, count: {$sum: 1}}};
    const project = {$project: {count: 1, division_id: "$_id.division_id", is_return: "$_id.is_return", _id: 0}};
    DeliveryModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: ords});
    });
  }
});

router.post("/getOutwardbydivision", (req, res) => {
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.limit && req.body.limit !== null &&
  req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.session.branch);

    const condition = {division_id: divid, is_deleted: false, is_active: true};
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
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.session.branch);

    const condition = { is_deleted: false,
      is_active: true,
      division_id: divid};
    if (req.body.filterby !== "ALL") {
      condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
    }
    const matched = {$match: condition};
    const groups = {$group: {_id: {division_id: "$division_id", is_return: "$is_return"}, count: {$sum: 1}}};
    const project = {$project: {count: 1, division_id: "$_id.division_id", is_return: "$_id.is_return", _id: 0}};
    DeliveryModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: ords});
      }
    });
  }
});

router.post("/getOutwardbycustomer", (req, res) => {
  if (req.body.customerID && req.body.customerID !== null && req.body.limit && req.body.limit !== null) {
    const condition = {customer_id: req.body.customerID, is_deleted: false, is_active: true, is_return: false};

    if (req.body.skip && req.body.skip !== "" && req.body.skip.length > 0) {
      condition._id = {$nin: req.body.skip};
    }

    const select = "order_id order_no customer_name customer_mobile_no order_status order_date delivery_no delivery_date outward_data is_return";
    const query = DeliveryModel.find(condition, select).limit(parseInt(req.body.limit)).sort({delivery_date: "desc"});

    query.exec((err, delivery) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: delivery});
      }
    });
  }
});

router.get("/getCompleteddeliverybyId/:id/:customerID", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "" && req.params.customerID && req.params.customerID !== null &&
  req.params.customerID !== "") {
    async.parallel([
      function (callback) { // Fetch Delivery details
        const condition = {order_id: req.params.id, customer_id: req.params.customerID, is_deleted: false, is_active: true};
        DeliveryModel.find(condition, "order_no order_id division_id delivery_no delivery_date outward_data is_return").exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            callback(null, orders);
          }
        });
      },
      function (callback) { // Fetch special price
        const condition = {order_id: req.params.id, customer_id: req.params.customerID, is_deleted: false, is_active: true};
        SpecialPriceModel.find(condition, "order_id division_id process_id measurement_id qty price").exec((err, users) => {
          if (err) {
            callback(err);
          } else {
            callback(null, users);
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
      initData.Delivery = results[0] || [];
      initData.Specialprice = results[1] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.post("/getOutwardoverview", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.filterby !== null && req.body.filterby !== null) {
    req.filters = commonfunction.filterdateByparam(req.body.filterby);
    const condition = {division_id: req.body.divisionID,
      is_deleted: false,
      is_active: true,
      is_return: false,
      created: {$gte: req.filters.startDate, $lte: req.filters.endDate}};
    if (req.body.divisionID !== "ALL") {
      condition.division_id = req.body.divisionID;
    }

    async.parallel([
      function (callback) { // Fetch Division Details
        const query = DeliveryModel.find(condition, "division_id order_id is_return");

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          }
          callback(null, orders);
        });
      },
      function (callback) { // Fetch Division Details
        condition.is_return = true;
        const query = DeliveryModel.find(condition, "division_id order_id is_return");

        query.exec((err, returnOrder) => {
          if (err) {
            callback(err);
          }
          callback(null, returnOrder);
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      const initData = {};
      initData.deliveryOrders = results[0] || [];
      initData.returnOrders = results[1] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/getDeliveryeditview/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { division_id: req.session.branch,
        is_deleted: false,
        is_active: true };
      condition.outward_delivery = mongoose.Types.ObjectId(req.params.id);
              
      let select = "order_no order_serial_no order_date division_id customer_id customer_name customer_mobile_no billing_address_line billing_area ";
      select += "billing_city billing_pincode billing_state contactperson order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no ";
      select += "dyeing_dc_date order_status deilvery_status order_type billable received_weight delivered_weight returned_weight ";
      select += "inwards outward_delivery return_delivery contract_outward contract_inward";

      let inwardselect = "inward_no inward_serial_no inward_date division_id order_reference_no customer_id customer_name ";
      inwardselect += "customer_mobile_no inward_data total_weight total_delivered_weight total_returned_weight inward_status";

      let outwardselect = "order_id is_return outward_data.delivery_roll outward_data.delivery_status outward_data.delivery_weight ";
      outwardselect += "outward_data.inward_data_id outward_data.inward_id outward_data.fabric_id outward_data.rolls outward_data.weight outward_data._id";
      
      let contractoutward = "order_id outward_status outward_data.delivery_roll outward_data.delivery_status outward_data.delivery_weight ";
      contractoutward += "outward_data.inward_data_id outward_data.inward_id outward_data.rolls outward_data.weight outward_data._id";
      
      async.parallel([
        function (callback) { // Fetch Division Details
          const query = OrderModel.findOne(condition, select).populate("inwards", inwardselect).populate("outward_delivery", outwardselect)
        .populate("return_delivery", outwardselect).populate("contract_outward", contractoutward);

          query.exec((err, orders) => {
            if (err) {
              callback(err);
            }
            callback(null, orders);
          });
        },
        function (callback) { // Fetch Division Details
          const cond = { _id: req.params.id,
            is_deleted: false,
            is_active: true };
          const query = DeliveryModel.findOne(cond);

          query.exec((err, delivery) => {
            if (err) {
              callback(err);
            }
            callback(null, delivery);
          });
        },
      ], (err, results) => { // Compute all results
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }
        if (!results[0] || results[0] === null && !results[0]._id) {
          return res.send({ success: false, message: "Order details not found for this delivery" });
        }
        if (results[0].order_status && (results[0].order_status === "Completed" || results[0].order_status === "Invoice and Delivery")) {
          return res.send({ success: false, message: "You cannot edit the delivery of the "+results[0].order_status+" Order" });
        }
        if (!results[1] || results[1] === null && !results[1]._id) {
          return res.send({ success: false, message: "Delivery details not found" });
        }
        
        const initData = {};
        initData.Order = results[0] || [];
        initData.Delivery = results[1] || [];

        return res.send({success: true, data: initData});
      });
    } else {
      return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
    }
  }
});

module.exports = router;
