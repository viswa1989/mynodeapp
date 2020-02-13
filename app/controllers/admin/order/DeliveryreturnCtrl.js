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
    } else {
      res.send({success: true, data});
    }
  });
});

router.post("/save", (req, res) => {
  if (req.body.deliveryreturnForm) {
    if (!req.body.deliveryreturnForm.outwardData || req.body.deliveryreturnForm.outwardData === null ||
        req.body.deliveryreturnForm.outwardData === "" || req.body.deliveryreturnForm.outwardData.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    if (req.body.deliveryreturnForm.order_id && req.body.deliveryreturnForm.order_id !== null && req.body.deliveryreturnForm.order_id !== "") {
      OrderModel.findOne({_id: req.body.deliveryreturnForm.order_id}).populate("inwards").exec((err, order) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (order && order !== null && order._id) {
          if (order.inwards && order.inwards !== null && order.inwards.length > 0) {
            DivisionaccountModel.findOne({division_id: req.session.branch}, "division_id return").exec((diverr, Divisionaccount) => {
              if (diverr) {
                res.status(499).send({message: errorhelper.getErrorMessage(diverr)});
              } else if (Divisionaccount && Divisionaccount !== null && Divisionaccount._id && Divisionaccount._id !== "" &&
              Divisionaccount.return && Divisionaccount.return.prefix && Divisionaccount.return.serial_no &&
              Divisionaccount.return.prefix !== "" && Divisionaccount.return.serial_no !== "") {
                let newDelivery = new DeliveryModel({
                  delivery_no: `${Divisionaccount.return.prefix}${Divisionaccount.return.serial_no}`,
                  delivery_serial_no: Divisionaccount.return.serial_no,
                  order_no: req.body.deliveryreturnForm.order_no,
                  order_id: req.body.deliveryreturnForm.order_id,
                  order_date: req.body.deliveryreturnForm.order_date,
                  division_id: req.session.branch,
                  customer_id: req.body.deliveryreturnForm.customer_id,
                  customer_name: req.body.deliveryreturnForm.customer_name,
                  customer_mobile_no: req.body.deliveryreturnForm.customer_mobile_no,
                  billing_company_name: req.body.deliveryreturnForm.billing_company_name,
                  billing_gstin: req.body.deliveryreturnForm.billing_gstin,
                  billing_address_line: req.body.deliveryreturnForm.billing_address_line,
                  billing_area: req.body.deliveryreturnForm.billing_area,
                  billing_city: req.body.deliveryreturnForm.billing_city,
                  billing_pincode: req.body.deliveryreturnForm.billing_pincode,
                  billing_state: req.body.deliveryreturnForm.billing_state,
                  delivery_company_name: req.body.deliveryreturnForm.delivery_company_name,
                  delivery_address_line: req.body.deliveryreturnForm.delivery_address_line,
                  delivery_city: req.body.deliveryreturnForm.delivery_city,
                  delivery_pincode: req.body.deliveryreturnForm.delivery_pincode,
                  delivery_state: req.body.deliveryreturnForm.delivery_state,
                  vehicle_no: req.body.deliveryreturnForm.vehicle_no,
                  driver_name: req.body.deliveryreturnForm.driver_name,
                  driver_no: req.body.deliveryreturnForm.driver_no,
                  order_type: req.body.deliveryreturnForm.order_type,
                  outward_data: req.body.deliveryreturnForm.outwardData,
                  is_return: true,
                });
                newDelivery = commonfunction.beforeSave(newDelivery, req);

                newDelivery.save((outwarderr, outwards) => {
                  if (outwarderr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
                  } else if (outwards && outwards !== null && outwards._id) {
                    const brquery = {division_id: req.session.branch};
                    const vquery = {vehicle_no: req.body.deliveryreturnForm.vehicle_no};
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    const driquery = {driver_name: req.body.deliveryreturnForm.driver_name};
                    const updatedri = { driver_name: req.body.deliveryreturnForm.driver_name, driver_no: req.body.deliveryreturnForm.driver_no };

                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"return.serial_no": 1}}, (brerr, bdata) => {
                      if (brerr) {
                        res.status(499).send({message: errorhelper.getErrorMessage(brerr)});
                      } else if (bdata && bdata !== null && bdata._id) {
                        order.return_delivery.push(outwards._id);

                        order.save((ordererr, orderData) => {
                          if (ordererr) {
                            DeliveryModel.findByIdAndRemove(outwards._id, (errrem) => { });
                            res.status(499).send({message: errorhelper.getErrorMessage(ordererr)});
                            return;
                          } else if (orderData && orderData !== null && orderData._id) {
                            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});
                            
                            const obj = {};
                            obj.data = orderData;
                            obj.data.delivery_no = outwards.delivery_no;
                            obj.PAGE = "DELIVERY RETURN";
                            const logdata = outwardpagelog.saveReturndelivery(obj, req);
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
                return res.send({success: false, message: "Delivery return prefix & serial no not found"});
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
  if (req.body.deliveryreturnForm && req.body.deliveryreturnForm._id) {
    if (!req.body.deliveryreturnForm.outward_data || req.body.deliveryreturnForm.outward_data === null || req.body.deliveryreturnForm.outward_data === "" ||
    req.body.deliveryreturnForm.outward_data.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    
    DeliveryModel.findOne({_id: req.body.deliveryreturnForm._id}).exec((err, deliverydata) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (deliverydata && deliverydata !== null && deliverydata._id) {
        
        deliverydata.billing_company_name = req.body.deliveryreturnForm.billing_company_name;
        deliverydata.billing_gstin = req.body.deliveryreturnForm.billing_gstin;
        deliverydata.billing_address_line = req.body.deliveryreturnForm.billing_address_line;
        deliverydata.billing_area = req.body.deliveryreturnForm.billing_area;
        deliverydata.billing_city = req.body.deliveryreturnForm.billing_city;
        deliverydata.billing_pincode = req.body.deliveryreturnForm.billing_pincode;
        deliverydata.billing_state = req.body.deliveryreturnForm.billing_state;
        deliverydata.delivery_company_name = req.body.deliveryreturnForm.delivery_company_name;
        deliverydata.delivery_address_line = req.body.deliveryreturnForm.delivery_address_line;
        deliverydata.delivery_city = req.body.deliveryreturnForm.delivery_city;
        deliverydata.delivery_pincode = req.body.deliveryreturnForm.delivery_pincode;
        deliverydata.delivery_state = req.body.deliveryreturnForm.delivery_state;
        deliverydata.vehicle_no = req.body.deliveryreturnForm.vehicle_no;
        deliverydata.driver_name = req.body.deliveryreturnForm.driver_name;
        deliverydata.driver_no = req.body.deliveryreturnForm.driver_no;
        deliverydata.outward_data = req.body.deliveryreturnForm.outward_data;
        
        deliverydata = commonfunction.beforeSave(deliverydata, req);

        deliverydata.save((outwarderr, outwards) => {
          if (outwarderr) {
            res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
          } else if (outwards && outwards !== null && outwards._id) {
            const brquery = {division_id: deliverydata.division_id};
            const vquery = {vehicle_no: req.body.deliveryreturnForm.vehicle_no};
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            const driquery = {driver_name: req.body.deliveryreturnForm.driver_name};
            const updatedri = { driver_name: req.body.deliveryreturnForm.driver_name, driver_no: req.body.deliveryreturnForm.driver_no };
            
            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});
            
            const obj = {};
            obj.data = outwards;
            obj.PAGE = "DELIVERY OUTWARD";
            const logdata = outwardpagelog.updateReturndelivery(obj, req);
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

router.post("/getOutwardreturn", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.limit && req.body.limit !== null) {
    const condition = {is_deleted: false, is_active: true, is_return: true};

    if (req.body.skip && req.body.skip !== "" && req.body.skip.length > 0) {
      condition._id = {$nin: req.body.skip};
    }

    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      condition.division_id = req.session.branch;
    } else if (req.body.divisionID !== "All") {
      condition.division_id = req.body.divisionID;
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

router.post("/getOutwardreturnbydivision", (req, res) => {
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.limit && req.body.limit !== null) {
    const condition = {is_deleted: false, is_active: true, division_id: req.session.branch, is_return: true};

    if (req.body.skip && req.body.skip !== "" && req.body.skip.length > 0) {
      condition._id = {$nin: req.body.skip};
    }

    const select = "order_id order_no customer_name customer_mobile_no order_status order_date delivery_no delivery_date outward_data is_return";
    const query = DeliveryModel.find(condition, select).limit(parseInt(req.body.limit)).sort({delivery_date: "desc"});

    query.exec((err, delivery) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: delivery});
    });
  }
});

router.get("/getDeliveryeditview/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { division_id: req.session.branch,
        is_deleted: false,
        is_active: true };
      condition.return_delivery = mongoose.Types.ObjectId(req.params.id);
              
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
