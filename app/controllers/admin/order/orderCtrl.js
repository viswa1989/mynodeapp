const auth = require("../../../../app/middlewares/auth");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const ordertracklog = require("../../../../app/middlewares/ordertracklog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const InwardModel = require("../../../../app/models/InwardModel");
const OrderModel = require("../../../../app/models/OrderModel");
const DeliveryModel = require("../../../../app/models/DeliveryModel");
const BillModel = require("../../../../app/models/BillModel");
const ProcessModel = require("../../../../app/models/ProcessModel");
const FabColor = require("../../../../app/models/FabColorModel");
const FabMeasure = require("../../../../app/models/FabMeasureModel");
const DyeingDetails = require("../../../../app/models/DyeingDetailsModel");
const DivisionModel = require("../../../../app/models/DivisionsModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const JobcardstatusModel = require("../../../../app/models/JobcardstatusModel");
const SpecialPriceModel = require("../../../../app/models/SpecialPriceModel");
const UserModel = require("../../../../app/models/UsersModel");
const CustomergroupsModel = require("../../../../app/models/CustomergroupsModel");
// const OrderreturnModel = require("../../../../app/models/OrderreturnModel");
const OutwardModel = require("../../../../app/models/OutwardModel");
const ContractinwardModel = require("../../../../app/models/ContractinwardModel");
const TaxModel = require("../../../../app/models/TaxesModel");
const StatelistModel = require("../../../../app/models/StatelistModel");
const GsttreatmentModel = require("../../../../app/models/GsttreatmentModel");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");
const CustomerModel = require("../../../../app/models/CustomersModel");
const smshelper = require("../../../../app/helpers/smsqueuehelper");
const PreferenceModel = require("../../../../app/models/PreferenceModel");
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

// Initilaize data for job card
router.get("/initializedata", (req, res) => {
  async.parallel([
    function (callback) { // Fetch Process
      const query = ProcessModel.find({ division_id: req.session.branch, is_deleted: false, is_active: true }, "_id process_name color");

      query.exec((err, process) => {
        if (err) {
          callback(err);
        } else {
          callback(null, process);
        }
      });
    },
    function (callback) { // Fetch Fabric colors
      const query = FabColor.find({ is_deleted: false, is_active: true }, "_id fabric_color color fabric_color_code");

      query.exec((err, fabcolor) => {
        if (err) {
          callback(err);
        } else {
          callback(null, fabcolor);
        }
      });
    },
    function (callback) { // Fetch Dyeing details
      const query = DyeingDetails.find({ is_deleted: false, is_active: true }, "_id dyeing_name");

      query.exec((err, dyes) => {
        if (err) {
          callback(err);
        } else {
          callback(null, dyes);
        }
      });
    },
    function (callback) { // Fetch Measurement details
      const query = FabMeasure.find({ is_deleted: false, is_active: true }, "_id fabric_measure");

      query.exec((err, fabunits) => {
        if (err) {
          callback(err);
        } else {
          callback(null, fabunits);
        }
      });
    },
    function (callback) { // Fetch Division details
      const query = DivisionModel.findOne({ _id: req.session.branch, is_deleted: false }, "billing_address");

      query.exec((err, division) => {
        if (err) {
          callback(err);
        } else {
          callback(null, division);
        }
      });
    },
    function (callback) { // Fetch State list
      const query = StatelistModel.find({}).sort({ name: "asc" });
      query.exec((err, State) => {
        if (err) {
          callback(err);
        } else {
          callback(null, State);
        }
      });
    },
    function (callback) { // Fetch GST Treatment list
      const query = GsttreatmentModel.find({});
      query.exec((err, Gst) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Gst);
        }
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }

    if (results === null || results[0] === null) {
      return res.send({ success: false, message: "Something went wrong please try again later!." });
    }

    const initData = {};
    initData.Process = results[0] || [];
    //        initData.Fabrictype = results[1] || [];
    initData.Fabriccolor = results[1] || [];
    initData.Dyeingdetails = results[2] || [];
    initData.Measurementdetails = results[3] || [];
    initData.Divisiondetails = results[4] || [];
    initData.Statelistdetails = results[5] || [];
    initData.Gsttreatmentdetails = results[6] || [];
    initData.order_date = new Date();

    return res.send({ success: true, data: initData });
  });
});

// Initilaize data for edit job card
router.get("/editinitializedata", (req, res) => {
  async.parallel([
    function (callback) { // Fetch Process
      const query = ProcessModel.find({ division_id: req.session.branch, is_deleted: false, is_active: true }, "_id process_name color");

      query.exec((err, process) => {
        if (err) {
          callback(err);
        } else {
          callback(null, process);
        }
      });
    },
    function (callback) { // Fetch Fabric colors
      const query = FabColor.find({ is_deleted: false, is_active: true }, "_id fabric_color color fabric_color_code");

      query.exec((err, fabcolor) => {
        if (err) {
          callback(err);
        } else {
          callback(null, fabcolor);
        }
      });
    },
    function (callback) { // Fetch Dyeing details
      const query = DyeingDetails.find({ is_deleted: false, is_active: true }, "_id dyeing_name");

      query.exec((err, dyes) => {
        if (err) {
          callback(err);
        } else {
          callback(null, dyes);
        }
      });
    },
    function (callback) { // Fetch Measurement details
      const query = FabMeasure.find({ is_deleted: false, is_active: true }, "_id fabric_measure");

      query.exec((err, fabunits) => {
        if (err) {
          callback(err);
        } else {
          callback(null, fabunits);
        }
      });
    },
    function (callback) { // Fetch Division details
      const query = DivisionModel.findOne({ _id: req.session.branch, is_deleted: false }, "billing_address");

      query.exec((err, division) => {
        if (err) {
          callback(err);
        } else {
          callback(null, division);
        }
      });
    },
    function (callback) { // Fetch State list
      const query = StatelistModel.find({}).sort({ name: "asc" });
      query.exec((err, State) => {
        if (err) {
          callback(err);
        } else {
          callback(null, State);
        }
      });
    },
    function (callback) { // Fetch GST Treatment list
      const query = GsttreatmentModel.find({});
      query.exec((err, Gst) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Gst);
        }
      });
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      return;
    }

    if (results === null || results[0] === null) {
      return res.send({ success: false, message: "Something went wrong please try again later!." });
    }

    const initData = {};
    initData.Process = results[0] || [];
    //        initData.Fabrictype = results[1] || [];
    initData.Fabriccolor = results[1] || [];
    initData.Dyeingdetails = results[2] || [];
    initData.Measurementdetails = results[3] || [];
    initData.Divisiondetails = results[4] || [];
    initData.Statelistdetails = results[5] || [];
    initData.Gsttreatmentdetails = results[6] || [];

    return res.send({ success: true, data: initData });
  });
});

function updateDivision(userdata, req, callback) {
  const userDivision = userdata.division_id;
  let exist = "false";

  async.mapSeries(userDivision, (item, callbk) => {
    if (item.equals(req.session.branch)) {
      exist = "true";
      callbk(null, item);
    } else {
      callbk(null, item);
    }
  }, (err) => {
    if (exist === "false") {
      CustomerModel.findOne({ _id: userdata._id }, (cuerr, user) => {
        if (cuerr) {
          callback(cuerr, null);
        } else if (user && user !== null && user._id) {
          user.division_id.push(req.session.branch);

          user = commonfunction.beforeSave(user, req);

          user.save((errs, users) => {
            if (errs) {
              callback(errs, null);
            } else if (users && users !== null && users._id) {
              exist = true;
              callback(null, "true");
            } else {
              callback(null, "false");
            }
          });
        }
      });
    } else {
      callback(null, exist);
    }
  });
}

router.post("/save", (req, res) => {
  if (req.body.orderForm) {
    if (!req.body.orderForm.inwardData || req.body.orderForm.inwardData === null || req.body.orderForm.inwardData === "" ||
        req.body.orderForm.inwardData.length === 0) {
      return res.send({ success: false, message: "Inward details not found" });
    }
    if (req.body.orderForm.order_type === "Reprocess" && (!req.body.orderForm.reprocess_orderid || 
            req.body.orderForm.reprocess_orderid === null || req.body.orderForm.reprocess_orderid === "")) {
      return res.send({ success: false, message: "Reprocess order not found" });
    }
    if (req.body.orderForm.order_type === "Reprocess" && (!req.body.orderForm.reprocess_orderno || 
            req.body.orderForm.reprocess_orderno === null || req.body.orderForm.reprocess_orderno === "")) {
      return res.send({ success: false, message: "Reprocess order no not found" });
    }
    CustomerModel.findOne({ _id: req.body.orderForm.customer_id }, (cuerr, user) => {
      if (cuerr) {
        res.status(499).send({ message: errorhelper.getErrorMessage(cuerr) });
      } else if (user && user !== null && user._id) {
        if (user.division_id && user.division_id !== null && user.division_id.length > 0) {
          updateDivision(user, req, (orderr, ordData) => {
            if (orderr) {
              res.status(499).send({ message: errorhelper.getErrorMessage(orderr) });
            } else if (ordData && ordData !== null) {
              if (ordData === "true") {
                const query = DivisionaccountModel.findOne({ division_id: req.session.branch }, "division_id inward");

                query.exec((diverr, Divisionaccount) => {
                  if (diverr) {
                    res.status(499).send({ message: errorhelper.getErrorMessage(diverr) });
                  } else if (Divisionaccount && Divisionaccount !== null && Divisionaccount._id && Divisionaccount._id !== "" &&
                    Divisionaccount.inward && Divisionaccount.inward.prefix && Divisionaccount.inward.serial_no &&
                    Divisionaccount.inward.prefix !== "" && Divisionaccount.inward.serial_no !== "") {
                    const queryord = DivisionaccountModel.findOne({ division_id: req.session.branch }, "division_id order");

                    queryord.exec((orddiverr, ordDivisionaccount) => {
                      if (orddiverr) {
                        res.status(499).send({ message: errorhelper.getErrorMessage(orddiverr) });
                      } else if (ordDivisionaccount && ordDivisionaccount !== null && ordDivisionaccount._id &&
                        ordDivisionaccount._id !== "" && ordDivisionaccount.order && ordDivisionaccount.order.prefix &&
                        ordDivisionaccount.order.serial_no && ordDivisionaccount.order.prefix !== "" &&
                        ordDivisionaccount.order.serial_no !== "") {
                        let newInward = new InwardModel({
                          inward_no: `${Divisionaccount.inward.prefix}${Divisionaccount.inward.serial_no}`,
                          inward_serial_no: Divisionaccount.inward.serial_no,
                          division_id: req.session.branch,
                          order_reference_no: req.body.orderForm.order_reference_no,
                          customer_id: req.body.orderForm.customer_id,
                          customer_name: req.body.orderForm.customer_name,
                          customer_mobile_no: req.body.orderForm.customer_mobile_no,
                          inward_data: req.body.orderForm.inwardData,
                          inward_status: "Allocated",
                        });

                        newInward = commonfunction.beforeSave(newInward, req);

                        newInward.validate((validerr) => {
                          if (validerr) {
                            res.status(499).send({ message: errorhelper.getErrorMessage(validerr) });
                            return;
                          }
                          const brquery = { division_id: Divisionaccount.division_id };

                          DivisionaccountModel.findOneAndUpdate(brquery, { $inc: { "inward.serial_no": 1 } }, (dbrerr, bdata) => {
                            if (dbrerr) {
                              res.status(499).send({ message: errorhelper.getErrorMessage(dbrerr) });
                            } else if (bdata && bdata !== null && bdata._id) {
                              newInward.inward_no = `${bdata.inward.prefix}${bdata.inward.serial_no}`;
                              newInward.inward_serial_no = bdata.inward.serial_no;

                              newInward.save((err, inwards) => {
                                if (err) {
                                  DivisionaccountModel.findOneAndUpdate(brquery, { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                  res.status(499).send({ message: errorhelper.getErrorMessage(err) });
                                } else if (inwards && inwards !== null && inwards._id) {
                                  let newOrder = new OrderModel({
                                    order_no: `${ordDivisionaccount.order.prefix}${ordDivisionaccount.order.serial_no}`,
                                    order_serial_no: ordDivisionaccount.order.serial_no,
                                    division_id: req.session.branch,
                                    customer_id: req.body.orderForm.customer_id,
                                    customer_name: req.body.orderForm.customer_name,
                                    customer_mobile_no: req.body.orderForm.customer_mobile_no,
                                    billing_address_line: req.body.orderForm.billing_address_line,
                                    billing_area: req.body.orderForm.billing_area,
                                    billing_city: req.body.orderForm.billing_city,
                                    billing_pincode: req.body.orderForm.billing_pincode,
                                    billing_state: req.body.orderForm.billing_state,
                                    contactperson: req.body.orderForm.contactperson,
                                    order_reference_no: req.body.orderForm.order_reference_no,
                                    customer_dc_no: req.body.orderForm.customer_dc_no,
                                    customer_dc_date: req.body.orderForm.customer_dc_date,
                                    dyeing: req.body.orderForm.dyeing,
                                    dyeing_dc_no: req.body.orderForm.dyeing_dc_no,
                                    order_type: req.body.orderForm.order_type,
                                    immediate_job: req.body.orderForm.immediate_job,
                                    order_status: "New Order",
                                    received_weight: inwards.total_weight,
                                    deilvery_status: "Initial",
                                  });
                                  if (req.body.orderForm.dyeing_dc_date && req.body.orderForm.dyeing_dc_date !== "" &&
                                  req.body.orderForm.dyeing_dc_date !== null) {
                                    newOrder.dyeing_dc_date = req.body.orderForm.dyeing_dc_date;
                                  }
                                  if (req.body.orderForm.order_type === "Reprocess") {
                                    newOrder.billable = req.body.orderForm.is_billable;
                                    newOrder.reprocess_orderid = req.body.orderForm.reprocess_orderid;
                                    newOrder.reprocess_orderno = req.body.orderForm.reprocess_orderno;
                                  }
                                  newOrder = commonfunction.beforeSave(newOrder, req);
                                  newOrder.inwards = [];
                                  newOrder.inwards.push(inwards._id);

                                  newOrder.validate((ordervaliderr) => {
                                    if (ordervaliderr) {
                                      InwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                                      DivisionaccountModel.findOneAndUpdate(brquery, { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                      res.status(499).send({ message: errorhelper.getErrorMessage(ordervaliderr) });
                                    } else {
                                      const brordquery = { division_id: ordDivisionaccount.division_id };

                                      DivisionaccountModel.findOneAndUpdate(brordquery, { $inc: { "order.serial_no": 1 } }, (acerr, acdata) => {
                                        if (acerr) {
                                          InwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                                          DivisionaccountModel.findOneAndUpdate(brquery,
                                            { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                          res.status(499).send({ message: errorhelper.getErrorMessage(acerr) });
                                        } else if (acdata && acdata !== null && acdata._id) {
                                          newOrder.order_no = `${acdata.order.prefix}${acdata.order.serial_no}`;
                                          newOrder.order_serial_no = acdata.order.serial_no;

                                          newOrder.save((orerr, orders) => {
                                            if (orerr) {
                                              InwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                                              DivisionaccountModel.findOneAndUpdate(brquery,
                                                { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                              DivisionaccountModel.findOneAndUpdate(brordquery,
                                                { $inc: { "order.serial_no": -1 } }, (brerr) => { });
                                              res.status(499).send({ message: errorhelper.getErrorMessage(orerr) });
                                            } else if (orders && orders !== null && orders._id) {
                                              PreferenceModel.findOne({module: "SMS", preference: "order"}, "preference value",
                                                (prerr, preference) => {
                                                  if (preference && preference !== null && preference._id && preference.value === "YES") {
                                                    smshelper.saveorder(orders);
                                                  }
                                                });
                                              const obj = {};
                                              obj.data = orders;
                                              obj.PAGE = "ORDER";
                                              const logdata = ordertracklog.saveOrder(obj, req);
                                              if (logdata.message && logdata.message !== null) {
                                                notificationlog.savelog(logdata, res);
                                              }

                                              res.send({ success: true, message: "Order successfully created!", data: orders });
                                            } else {
                                              InwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                                              DivisionaccountModel.findOneAndUpdate(brquery,
                                                { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                              DivisionaccountModel.findOneAndUpdate(brordquery,
                                                { $inc: { "order.serial_no": -1 } }, (brerr) => { });
                                              res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                                            }
                                          });
                                        } else {
                                          InwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                                          DivisionaccountModel.findOneAndUpdate(brquery,
                                            { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                                        }
                                      });
                                    }
                                  });
                                } else {
                                  DivisionaccountModel.findOneAndUpdate(brquery, { $inc: { "inward.serial_no": -1 } }, (brerr) => { });
                                  return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                                }
                              });
                            } else {
                              return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                            }
                          });
                        });
                      } else {
                        return res.send({ success: false, message: "Order prefix & serial no not found" });
                      }
                    });
                  } else {
                    return res.send({ success: false, message: "Inward prefix & serial no not found" });
                  }
                });
              } else {
                return res.send({ success: false, message: "Customer division details not found" });
              }
            } else {
              return res.send({ success: false, message: "Something went wrong please try again later!." });
            }
          });
        } else {
          return res.send({ success: false, message: "Customer details not found" });
        }
      } else {
        return res.send({ success: false, message: "Customer details not found" });
      }
    });
  }
});

router.post("/update", (req, res) => {
  if (req.body.orderForm) {
    if (!req.body.orderForm.inwards || req.body.orderForm.inwards === null || req.body.orderForm.inwards === "" ||
        req.body.orderForm.inwards.length === 0) {
      return res.send({ success: false, message: "Inward details not found" });
    }
    if (!req.body.orderForm.inwards[0].inward_data || req.body.orderForm.inwards[0].inward_data === null || 
            req.body.orderForm.inwards[0].inward_data === "" || req.body.orderForm.inwards[0].inward_data.length === 0) {
      return res.send({ success: false, message: "Inward details not found" });
    }
    if (req.body.orderForm.order_type === "Reprocess" && (!req.body.orderForm.reprocess_orderid || 
            req.body.orderForm.reprocess_orderid === null || req.body.orderForm.reprocess_orderid === "")) {
      return res.send({ success: false, message: "Reprocess order not found" });
    }
    if (req.body.orderForm.order_type === "Reprocess" && (!req.body.orderForm.reprocess_orderno || 
            req.body.orderForm.reprocess_orderno === null || req.body.orderForm.reprocess_orderno === "")) {
      return res.send({ success: false, message: "Reprocess order no not found" });
    }
    
    OrderModel.findOne({_id: req.body.orderForm._id}).exec((err, Order) => {
      if (err) {
        return res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (Order && Order !== null && Order._id) {
        if ((Order.contract_outward && Order.contract_outward.length>0) || (Order.outward_delivery && Order.outward_delivery.length>0) || 
                (Order.return_delivery && Order.return_delivery.length>0)) {
          return res.send({ success: false, message: "You cannot edit this order details. Delivery / Outward for this order has been processed already" });
        } else {
          if (Order.inwards && Order.inwards !== null && Order.inwards.length>0) {
            InwardModel.findOne({_id: req.body.orderForm.inwards[0]._id}).exec((errs, Inward) => {
              if (errs) {
                return res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
              } else if (Inward && Inward !== null && Inward._id) {
                const preInward = Inward;
                Inward.order_reference_no = req.body.orderForm.order_reference_no;
                Inward.customer_id = req.body.orderForm.customer_id;
                Inward.customer_name = req.body.orderForm.customer_name;
                Inward.customer_mobile_no = req.body.orderForm.customer_mobile_no;
                Inward.inward_data = req.body.orderForm.inwards[0].inward_data;
                
                Inward = commonfunction.beforeSave(Inward, req);
                
                Inward.save((inerr, inwardData) => {
                  if (inerr) {
                    return res.status(499).send({ message: errorhelper.getErrorMessage(inerr) });
                  } else if (inwardData && inwardData !== null && inwardData._id) {
                    Order.customer_id = req.body.orderForm.customer_id;
                    Order.customer_name = req.body.orderForm.customer_name;
                    Order.customer_mobile_no = req.body.orderForm.customer_mobile_no;
                    Order.billing_address_line = req.body.orderForm.billing_address_line;
                    Order.billing_area = req.body.orderForm.billing_area;
                    Order.billing_city = req.body.orderForm.billing_city;
                    Order.billing_pincode = req.body.orderForm.billing_pincode;
                    Order.billing_state = req.body.orderForm.billing_state;
                    Order.contactperson = req.body.orderForm.contactperson;
                    Order.order_reference_no = req.body.orderForm.order_reference_no;
                    Order.customer_dc_no = req.body.orderForm.customer_dc_no;
                    Order.customer_dc_date = req.body.orderForm.customer_dc_date;
                    Order.dyeing = req.body.orderForm.dyeing;
                    Order.dyeing_dc_no = req.body.orderForm.dyeing_dc_no;
                    Order.order_type = req.body.orderForm.order_type;
                    Order.immediate_job = req.body.orderForm.immediate_job;
                    Order.received_weight = inwardData.total_weight;
                    if (req.body.orderForm.dyeing_dc_date && req.body.orderForm.dyeing_dc_date !== "" &&
                    req.body.orderForm.dyeing_dc_date !== null) {
                      Order.dyeing_dc_date = req.body.orderForm.dyeing_dc_date;
                    }
                    if (req.body.orderForm.order_type === "Reprocess") {
                      Order.billable = req.body.orderForm.is_billable;
                      Order.reprocess_orderid = req.body.orderForm.reprocess_orderid;
                      Order.reprocess_orderno = req.body.orderForm.reprocess_orderno;
                    }
                    Order = commonfunction.beforeSave(Order, req);
                    
                    Order.save((orerr, OrderData) => {
                      if (orerr) {
                        InwardModel.findOneAndUpdate({_id: inwardData._id}, preInward, (ordererr) => { });
                        return res.status(499).send({ message: errorhelper.getErrorMessage(orerr) });
                      } else if (OrderData && OrderData !== null && OrderData._id) {
//                        PreferenceModel.findOne({module: "SMS", preference: "order"}, "preference value",
//                          (prerr, preference) => {
//                            if (preference && preference !== null && preference._id && preference.value === "YES") {
//                              smshelper.saveorder(orders);
//                            }
//                          });
                        const obj = {};
                        obj.data = OrderData;
                        obj.PAGE = "ORDER";
                        const logdata = ordertracklog.updateOrder(obj, req);
                        if (logdata.message && logdata.message !== null) {
                          notificationlog.savelog(logdata, res);
                        }

                        res.send({ success: true, message: "Order successfully updated!", data: OrderData });
                      } else {
                        InwardModel.findOneAndUpdate({_id: inwardData._id}, preInward, (ordererr) => { });
                        return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                      }
                    });
                  } else {
                    return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                  }
                });
              } else {
                return res.send({ success: false, message: "Inward details not found" });
              }
            });
          } else {
            return res.send({ success: false, message: "Inward details not found" });
          }
        }
      } else {
        return res.send({ success: false, message: "Order details not found" });
      }
    });      
  }
});

router.post("/getOrder", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.divisionID !== "" && req.body.limit &&
    req.body.limit !== null && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.body.divisionID);
    const condition = { division_id: divid, is_deleted: false, is_active: true};
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

router.post("/getOrderstatbydivision", (req, res) => {
  if (req.body.divisionID && req.body.divisionID !== null && req.body.divisionID !== "" && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.body.divisionID);
    async.parallel([
      function (callback) { // Fetch Division Details
        const condition = { is_deleted: false,
          is_active: true,
          division_id: divid,
          is_return: true};
        if (req.body.filterby !== "ALL") {
          condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }
        const matched = {$match: condition};
        const groups = {$group: {_id: "$division_id", count: {$sum: 1}}};
        DeliveryModel.aggregate(matched, groups, (err, ords) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, ords);
          }
        });
      },
      function (callback) { // Fetch Division Details
        const obj = {is_deleted: false, is_active: true, division_id: divid};
        if (req.body.filterby !== "ALL") {
          obj.order_date = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }

        const match = {$match: obj};
        const group = {$group: {_id: "$order_status", count: {$sum: 1}}};
        //        const project = {$project:{"count": 1,"order_status":"$_id"}};
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

router.post("/getOrderbydivision", (req, res) => {
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.limit && req.body.limit !== null &&
    req.body.filterby && req.body.filterby !== null) {
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
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.session.branch);
    async.parallel([
      function (callback) { // Fetch Division Details
        const condition = { is_deleted: false,
          is_active: true,
          division_id: divid,
          is_return: true};
        if (req.body.filterby !== "ALL") {
          condition.created = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }
        const matched = {$match: condition};
        const groups = {$group: {_id: "$division_id", count: {$sum: 1}}};
        DeliveryModel.aggregate(matched, groups, (err, ords) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, ords);
          }
        });
      },
      function (callback) { // Fetch Division Details
        const obj = {is_deleted: false, is_active: true, division_id: divid};
        if (req.body.filterby !== "ALL") {
          obj.order_date = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }

        const match = {$match: obj};
        const group = {$group: {_id: "$order_status", count: {$sum: 1}}};
        //        const project = {$project:{"count": 1,"order_status":"$_id"}};
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

router.get("/view/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    async.parallel([
      function (callback) { // Fetch order details
        const condition = { _id: req.params.id, is_deleted: false, is_active: true };
        let select = "order_no order_serial_no order_date division_id customer_id customer_name customer_mobile_no billing_address_line ";
        select += "billing_area billing_city billing_pincode billing_state contactperson followupPerson order_reference_no customer_dc_no ";
        select += "customer_dc_date dyeing dyeing_dc_no dyeing_dc_date order_status deilvery_status order_type billable received_weight ";
        select += "delivered_weight returned_weight inwards outward_delivery return_delivery labReport labReportsummary";

        let inwardselect = "inward_no inward_serial_no inward_date division_id order_reference_no customer_id customer_name ";
        inwardselect += "customer_mobile_no inward_data total_weight total_delivered_weight total_returned_weight inward_status";

        let outwardselect = "delivery_no delivery_date division_id customer_id customer_name customer_mobile_no billing_address_line ";
        outwardselect += "billing_area billing_city billing_pincode billing_state outward_data delivery_company_name delivery_address_line ";
        outwardselect += "delivery_city delivery_pincode delivery_state vehicle_no driver_name driver_no is_return";

        let outwardreturnselect = "delivery_no delivery_date division_id customer_id customer_name customer_mobile_no billing_address_line ";
        outwardreturnselect += "billing_area billing_city billing_pincode billing_state outward_data delivery_company_name delivery_address_line ";
        outwardreturnselect += "delivery_city delivery_pincode delivery_state vehicle_no driver_name driver_no is_return";

        const query = OrderModel.findOne(condition, select).populate("inwards", inwardselect)
          .populate("outward_delivery", outwardselect).populate("return_delivery", outwardreturnselect)
          .sort({ order_date: "desc" });

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            callback(null, orders);
          }
        });
      },
      function (callback) { // Fetch invoice
        const query = BillModel.findOne({ "items.order_id": req.params.id, is_deleted: false, is_active: true });

        query.exec((err, invoice) => {
          if (err) {
            callback(err);
          } else {
            callback(null, invoice);
          }
        });
      },
      function (callback) { // Fetch jobcard status
        const query = UserModel.find({ role: { $nin: [1] }, is_deleted: false, is_active: true }, "name mobile_no division");

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

        query.exec((err, jobstat) => {
          if (err) {
            callback(err);
          } else {
            callback(null, jobstat);
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
        const query = SpecialPriceModel.find({ order_id: req.params.id }, "order_id division_id customer_id process_id measurement_id qty price");

        query.exec((err, prices) => {
          if (err) {
            callback(err);
          } else {
            callback(null, prices);
          }
        });
      },
      function (callback) { // Fetch contract outwards
        const cond = { order_id: req.params.id, is_deleted: false, is_active: true };
        let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_data outward_status ";
        select += "division_id contractor_id contractor_name contractor_mobile_no contractor_address1 contractor_address2 ";
        select += "contractor_pincode gstin_number driver_no driver_name vehicle_no";
        const query = OutwardModel.find(cond, select).sort({ outward_date: "desc" });

        query.exec((err, outwards) => {
          if (err) {
            callback(err);
          } else {
            callback(null, outwards);
          }
        });
      },
      function (callback) { // Fetch special price for order
        const condt = { order_id: req.params.id, is_deleted: false, is_active: true };
        let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_id inward_data ";
        select += "inward_no inward_date division_id contractor_id contractor_name contractor_mobile_no contractor_address1 contractor_address2 ";
        select += "contractor_pincode gstin_number driver_no driver_name vehicle_no contract_delivery_no contract_dc_date";
        const query = ContractinwardModel.find(condt, select).sort({ inward_date: "desc" });

        query.exec((err, inwards) => {
          if (err) {
            callback(err);
          } else {
            callback(null, inwards);
          }
        });
      },
      function (callback) {
        const orderid = mongoose.Types.ObjectId(req.params.id);
        const matchdata = {$match: {_id: orderid}};

        const group = {$group: {_id: "$customer_id", customer_name: { $first:"$cus.name"}, gstin: { $first:"$cus.gstin"}, 
                placeofSupply: { $first:"$cus.placeofSupply"}, mobile_no: { $first:"$cus.mobile_no"}}};

        const lookup = { $lookup: { from: "customers", localField: "customer_id", foreignField: "_id", as: "cus" } };
        OrderModel.aggregate(matchdata, lookup, {$unwind: "$cus"}, group, (eer, customer) => {
          if (eer) {
            callback(eer);
          } else {
            callback(null, customer);
          }
        });
      }
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
        return;
      }

      if (results === null || results[0] === null) {
        return res.send({ success: false, message: "Something went wrong please try again later!." });
      }

      const initData = {};
      initData.Orders = results[0] || [];
      initData.Invoice = results[1] || [];
      initData.Users = results[2] || [];
      initData.order_status = results[3] || [];
      initData.measurement = results[4] || [];
      initData.specialPrice = results[5] || [];
      initData.Outwards = results[6] || [];
      initData.Inwards = results[7] || [];
      initData.Customer = results[8] || [];

      return res.send({ success: true, data: initData });
    });
  }
});

router.get("/getOrderview/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = { _id: req.params.id, is_deleted: false, is_active: true };
    const query =  OrderModel.findOne(condition).populate("inwards");

    query.exec((err, orders) => {
      if (err) {
        return res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else {
        if(orders && orders !== null && orders._id && orders.order_status !== "New Order"){
          return res.send({ success: false, message: `You cannot edit the order in ${orders.order_status} status` });
        } else {
          return res.send({ success: true, data: orders });
        }
      }
    });
  }
});

router.get("/viewLabreport/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = { _id: req.params.id, is_deleted: false, is_active: true };
    const select = "labReport labReportsummary";
    const query = OrderModel.findOne(condition, select);

    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else {
        return res.send({ success: true, data: orders });
      }
    });
  }
});

function formatOrderdata(orders, req, callback) {
  const orderdata = [];
  const len = orders.inwards.length;
  let loopexecuted = 0;
  for (let i = 0; i < len; i += 1) {
    if (orders.inwards[i].inward_data && orders.inwards[i].inward_data !== null && orders.inwards[i].inward_data.length > 0) {
      for (let idata = 0; idata < orders.inwards[i].inward_data.length; idata += 1) {
        if (orders.inwards[i].inward_data[idata] && orders.inwards[i].inward_data[idata]._id &&
            orders.inwards[i].inward_data[idata].rolls && orders.inwards[i].inward_data[idata].weight) {
          const obj = {};
          obj.inward_id = orders.inwards[i]._id;
          obj.inward_data_id = orders.inwards[i].inward_data[idata]._id;
          obj.rolls = parseInt(orders.inwards[i].inward_data[idata].rolls);
          obj.weight = parseFloat(orders.inwards[i].inward_data[idata].weight);
          orderdata.push(obj);
        }
        if (idata === orders.inwards[i].inward_data.length - 1) {
          loopexecuted += 1;
        }
      }
    } else {
      loopexecuted += 1;
    }
  }
  if (len === loopexecuted) {
    callback(null, orderdata);
  }
}

function updateOrderstatus(orders, outwards, callback) {
  let weight = 0;

  if (outwards && outwards !== null && outwards.length > 0) {
    async.mapSeries(outwards, (item, callbk) => {
      if (item.outward_data && item.outward_data !== null && item.outward_data.length > 0) {
        async.forEachSeries(item.outward_data, (odata, callb) => {
          if (odata && odata.inward_id && odata.inward_data_id && odata.delivery_roll && orders.inward_id.equals(odata.inward_id) &&
                        orders.inward_data_id.equals(odata.inward_data_id)) {
            weight += parseFloat(odata.delivery_weight);
            callb(null, weight);
          } else {
            callb(null, weight);
          }
        }, (err) => {
          callbk(null, weight);
        });
      } else {
        callbk(null, weight);
      }
    }, (err) => {
      callback(null, weight);
    });
  } else {
    callback(null, weight);
  }
}

router.post("/updateStatus", (req, res) => {
  if (req.body._id && req.body._id !== null && req.body._id !== "" && req.body.order_status &&
    req.body.order_status !== null && req.body.order_status !== "") {
    const condition = { _id: req.body._id };
    const query = OrderModel.findOne(condition).populate("inwards").populate("outward_delivery").populate("return_delivery");

    query.exec((erd, orders) => {
      if (erd) {
        res.status(499).send({ message: errorhelper.getErrorMessage(erd) });
      } else if (orders && orders !== null && orders._id) {
        if (req.body.order_status === "New Order") {
          DeliveryModel.findOne({ order_id: orders.id, is_deleted: false, is_active: true }).exec((derr, delorders) => {
            if (derr) {
              res.status(499).send({ message: errorhelper.getErrorMessage(derr) });
            } else if (delorders && delorders !== null && delorders._id) {
              return res.send({ success: false,
                message: "You can't able to change the status of this order because, Delivery has been already initiated for this order." });
            } else {
              orders = commonfunction.beforeSave(orders, req);
              orders.order_status = req.body.order_status;

              OrderModel.findByIdAndUpdate(orders._id, orders, (errs, orderdata) => {
                if (errs) {
                  res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                  return;
                } else if (orderdata && orderdata !== null && orderdata._id) {
                  const obj = {};
                  obj.data = orderdata;
                  const logdata = ordertracklog.updateStatus(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }

                  return res.send({ success: true, message: "Order status updated successfully!", data: orderdata });
                }
                return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
              });
            }
          });
        } else if (req.body.order_status === "In Progress") {
          BillModel.findOne({ "items.order_id": orders._id, is_deleted: false, is_active: true }, (inverr, invdata) => {
            if (inverr) {
              res.status(499).send({ message: errorhelper.getErrorMessage(inverr) });
              return;
            } else if (invdata && invdata !== null && invdata._id) {
              return res.send({ success: false, message: "You can't able to change the status for the invoiced order." });
            }
            orders = commonfunction.beforeSave(orders, req);
            orders.order_status = req.body.order_status;

            OrderModel.findByIdAndUpdate(orders._id, orders, (errs, orderdata) => {
              if (errs) {
                res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                return;
              } else if (orderdata && orderdata !== null && orderdata._id) {
                const obj = {};
                obj.data = orderdata;
                const logdata = ordertracklog.updateStatus(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }

                return res.send({ success: true, message: "Order status updated successfully!", data: orderdata });
              }
              return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
            });
          });
        } else if (req.body.order_status === "Completed") {
          if ((orders.outward_delivery && orders.outward_delivery !== null && orders.outward_delivery.length > 0) ||
            (orders.return_delivery && orders.return_delivery !== null && orders.return_delivery.length > 0)) {
            if (orders.inwards && orders.inwards !== null && orders.inwards.length > 0) {
              const outcond = { order_id: orders._id, outward_status: "In Progress", is_deleted: false, is_active: true };
              OutwardModel.findOne(outcond, (oterr, otdata) => {
                if(oterr) {
                  return res.status(499).send({ message: errorhelper.getErrorMessage(oterr) });
                } else if (otdata && otdata !== null && otdata._id) {
                  return res.send({ success: false, message: "You cant change this order to completed untill the all contractor outwards for this order gets completed." });
                } else {
                  let weight_diffallowed = 10;
                    PreferenceModel.findOne({ module: "Delivery", preference: "weight_difference_percentage", is_deleted: false }, (err, data) => {
                      if (data && data !== null && data._id && data.value && data.value !== "" && parseInt(data.value) > 0) {
                        weight_diffallowed = parseInt(data.value);
                      }
                      formatOrderdata(orders, req, (orderr, ordData) => {
                        if (ordData && ordData !== null && ordData.length > 0) {
                          let deliveredweight = 0;
                          let deliveryDetails = [];
                          if (orders.outward_delivery && orders.outward_delivery !== null && orders.outward_delivery.length > 0) {
                            deliveryDetails = orders.outward_delivery;
                          }
                          if (orders.return_delivery && orders.return_delivery !== null && orders.return_delivery.length > 0) {
                            deliveryDetails = deliveryDetails.concat(orders.return_delivery);
                          }

                          async.mapSeries(ordData, (orderData, callbk) => {
                            const inwwt = parseFloat(orderData.weight);
                            updateOrderstatus(orderData, deliveryDetails, (errs, rdata) => {
                              if (rdata !== null && rdata !== "" && parseFloat(rdata) > 0) {
                                const orddiff = ((parseFloat(rdata) - parseFloat(inwwt)) / parseFloat(inwwt)) * 100;
                                deliveredweight += parseFloat(rdata);
                                if (orddiff <= weight_diffallowed && orddiff >= (-1 * weight_diffallowed)) {
                                  callbk(null, deliveredweight);
                                } else {
                                  callbk("You cannot change this order status to completed. Delivery for this order is not completed yet.", null);
                                }
                              } else {
                                callbk("Oops! something went wrong please try again later!.", null);
                              }
                            });
                          }, (ers, resultd) => {
                            if (ers) {
                              return res.send({ success: false, message: ers });
                            }
                            orders = commonfunction.beforeSave(orders, req);
                            orders.order_status = req.body.order_status;

                            OrderModel.findByIdAndUpdate(orders._id, orders, (errs, orderdata) => {
                              if (errs) {
                                res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                              } else if (orderdata && orderdata !== null && orderdata._id) {
                                const obj = {};
                                obj.data = orderdata;
                                const logdata = ordertracklog.updateStatus(obj, req);
                                if (logdata.message && logdata.message !== null) {
                                  notificationlog.savelog(logdata, res);
                                }

                                return res.send({ success: true, message: "Order status updated successfully!", data: orderdata });
                              } else {
                                return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                              }
                            });
                          });
                        }
                      });
                    });
                }
              });
            } else {
              return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
            }
          } else {
            return res.send({ success: false, message: "You cannot change the order status to completed without delivery." });
          }
        } else {
          return res.send({ success: false, message: "You cannot update the order status to invoice and delivery manually." });
        }
      } else {
        return res.send({ success: false, message: "Order not found." });
      }
    });
  }
});

router.get("/getcompletedOrders/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { customer_id: req.params.id,
        division_id: req.session.branch,
        order_status: "In Progress",
        is_deleted: false,
        is_active: true };
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
      let contractinward = "order_id outward_id inward_data.received_roll inward_data.inward_status inward_data.received_weight ";
      contractinward += "inward_data.inward_data_id inward_data.inward_id inward_data.rolls inward_data.weight inward_data.outward_data_id";
      
      OrderModel.find(condition, select).populate("inwards", inwardselect).populate("outward_delivery", outwardselect)
        .populate("return_delivery", outwardselect).populate("contract_outward", contractoutward).populate("contract_inward", contractinward)
        .exec((err, orders) => {
          if (err) {
            res.status(499).send({ message: errorhelper.getErrorMessage(err) });
            return;
          }
          return res.send({ success: true, data: orders });
        });
    } else {
      return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
    }
  }
});

router.get("/getreturnOrders/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const orderstatus = ["New Order", "In Progress"];
      const condition = { customer_id: req.params.id,
        division_id: req.session.branch,
        is_deleted: false,
        is_active: true };
      condition.order_status = {$in: orderstatus};
      
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
      let contractinward = "order_id outward_id inward_data.received_roll inward_data.inward_status inward_data.received_weight ";
      contractinward += "inward_data.inward_data_id inward_data.inward_id inward_data.rolls inward_data.weight inward_data.outward_data_id";
      
      OrderModel.find(condition, select).populate("inwards", inwardselect).populate("outward_delivery", outwardselect)
        .populate("return_delivery", outwardselect).populate("contract_outward", contractoutward).populate("contract_inward", contractinward)
        .exec((err, orders) => {
          if (err) {
            res.status(499).send({ message: errorhelper.getErrorMessage(err) });
            return;
          }
          return res.send({ success: true, data: orders });
        });
    } else {
      return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
    }
  }
});

router.get("/getcompletedOrdersbycustomer/:id/:division/:group", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "" && req.params.division && req.params.division !== null &&
    req.params.division !== "" && req.params.group && req.params.group !== null && req.params.group !== "") {
    async.parallel([
      function (callback) { // Fetch Order details
        const condition = { customer_id: req.params.id,
          division_id: req.params.division,
          order_status: "Completed",
          is_deleted: false,
          is_active: true, 
          $and: [
              { $or: [{order_type: "Reprocess",billable: true}, {order_type: "Normal"}] }
          ]};
      
        let orderselect = "order_no orderPrice order_reference_no followupPerson contactperson order_date customer_dc_no ";
        orderselect += "customer_dc_date dyeing dyeing_dc_no dyeing_dc_date outward_delivery";
        const outwardselect = "order_id delivery_no outward_data is_return";
        OrderModel.find(condition, orderselect).populate("outward_delivery", outwardselect).exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            callback(null, orders);
          }
        });
      },
      function (callback) { // Fetch discount price
        const cond = { _id: req.params.group, "group_discount.0": { $exists: true } };
        CustomergroupsModel.findOne(cond, "name group_discount").exec((err, Customergroup) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Customergroup);
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
        return;
      }

      if (results === null || results[0] === null) {
        return res.send({ success: false, message: "Something went wrong please try again later!." });
      }

      const initData = {};
      initData.Orders = results[0] || [];
      initData.Group = results[1] || [];

      return res.send({ success: true, data: initData });
    });
  }
});

router.post("/addLabreport", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReport) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        orders = commonfunction.beforeSave(orders, req);
        orders.labReport.push(req.body.labReport);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.saveLabreport(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Lab Reports added successfully!", data: orderdata });
          }
          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/addLabreportsummary", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReportsummary) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        orders = commonfunction.beforeSave(orders, req);
        orders.labReportsummary.push(req.body.labReportsummary);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.saveLabsummary(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Lab Reports added successfully!", data: orderdata });
          }
          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/updateLabreport", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReport && req.body.labReport !== null && req.body.labReport._id) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        const reports = orders.labReport.id(req.body.labReport._id);
        const index = orders.labReport.indexOf(reports);
        orders.labReport[index] = req.body.labReport;
        orders = commonfunction.beforeSave(orders, req);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.updateLabreport(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Lab Reports updated successfully!", data: orderdata });
          } else {
            return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
          }
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/updateLabreportsummary", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReportsummary &&
    req.body.labReportsummary !== null && req.body.labReportsummary._id) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        const summary = orders.labReportsummary.id(req.body.labReportsummary._id);
        const index = orders.labReportsummary.indexOf(summary);
        orders.labReportsummary[index] = req.body.labReportsummary;
        orders = commonfunction.beforeSave(orders, req);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.updateLabsummary(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Lab Reports updated successfully!", data: orderdata });
          }
          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/deleteLabreport", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReport && req.body.labReport !== null && req.body.labReport._id) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        const reports = orders.labReport.id(req.body.labReport._id);
        const index = orders.labReport.indexOf(reports);
        orders.labReport[index] = req.body.labReport;
        orders = commonfunction.beforeSave(orders, req);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.deleteLabreport(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            return res.send({ success: true, message: "Lab Reports deleted successfully!", data: orderdata });
          }
          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/deleteLabreportsummary", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.labReportsummary &&
    req.body.labReportsummary !== null && req.body.labReportsummary._id) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        const summary = orders.labReportsummary.id(req.body.labReportsummary._id);
        const index = orders.labReportsummary.indexOf(summary);
        orders.labReportsummary[index] = req.body.labReportsummary;
        orders = commonfunction.beforeSave(orders, req);

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orderdata;
            const logdata = ordertracklog.deleteLabsummary(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Lab Reports data deleted successfully!", data: orderdata });
          } else {
            return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
          }
        });
      } else {
        return res.send({ success: false, message: "Order not found" });
      }
    });
  }
});

router.post("/updateSpecialprice", (req, res) => {
  if (req.body.order_id && req.body.order_id !== "" && req.body.order_id !== null) {
    OrderModel.findOne({ _id: req.body.order_id }, (err, orders) => {
      if (orders && orders !== null && orders._id) {
        if (req.body._id && req.body._id !== "" && req.body._id !== null) {
          SpecialPriceModel.findOne({ _id: req.body._id }, (errs, priceData) => {
            if (errs) {
              res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            } else if (priceData && priceData !== null && priceData._id) {
              priceData = commonfunction.beforeSave(priceData, req);
              priceData.qty = req.body.qty;
              priceData.price = req.body.price;

              priceData.save((priceerrs, specialprice) => {
                if (priceerrs) {
                  res.status(499).send({ message: errorhelper.getErrorMessage(priceerrs) });
                  return;
                } else if (specialprice && specialprice !== null && specialprice._id) {
                  const obj = {};
                  obj.data = specialprice;
                  obj.data.order_no = orders.order_no;
                  const logdata = ordertracklog.saveSpecialprice(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }

                  return res.send({ success: true, message: "Process special price updated successfully!", data: specialprice });
                }
                return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
              });
            } else {
              return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
            }
          });
        } else {
          let priceData = new SpecialPriceModel();
          priceData.order_id = req.body.order_id;
          priceData.division_id = req.body.division_id;
          priceData.customer_id = req.body.customer_id;
          priceData.process_id = req.body.process_id;
          priceData.measurement_id = req.body.measurement_id;
          priceData.qty = req.body.qty;
          priceData.price = req.body.price;
          priceData = commonfunction.beforeSave(priceData, req);

          priceData.save((errs, specialprice) => {
            if (errs) {
              res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            } else if (specialprice && specialprice !== null && specialprice._id) {
              const obj = {};
              obj.data = specialprice;
              obj.data.order_no = orders.order_no;
              const logdata = ordertracklog.updateSpecialprice(obj, req);
              if (logdata.message && logdata.message !== null) {
                notificationlog.savelog(logdata, res);
              }

              return res.send({ success: true, message: "Process special price updated successfully!", data: specialprice });
            } else {
              return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
            }
          });
        }
      } else if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else {
        return res.send({ success: false, message: "Orders not found." });
      }
    });
  }
});

router.post("/updateOrderfollowup", (req, res) => {
  if (req.body._id && req.body._id !== null && req.body._id !== "" && req.body.followupPerson &&
    req.body.followupPerson !== null && req.body.followupPerson !== "") {
    OrderModel.findOne({ _id: req.body._id }, (err, orders) => {
      if (err) {
        res.status(499).send({ message: errorhelper.getErrorMessage(err) });
      } else if (orders && orders !== null && orders._id) {
        orders = commonfunction.beforeSave(orders, req);
        orders.followupPerson = req.body.followupPerson;

        orders.save((errs, orderdata) => {
          if (errs) {
            res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
            return;
          } else if (orderdata && orderdata !== null && orderdata._id) {
            const obj = {};
            obj.data = orders;
            const logdata = ordertracklog.updateFollowup(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({ success: true, message: "Order follow up person updated successfully!", data: orderdata });
          }
          return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
        });
      } else {
        return res.send({ success: false, message: "Orders not found." });
      }
    });
  }
});

router.get("/initializeInvoice/:id/:division_id/:customer_id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "" && req.params.division_id &&
        req.params.division_id !== null && req.params.division_id !== "" && req.params.customer_id &&
        req.params.customer_id !== null && req.params.customer_id !== "") {
    OrderModel.findOne({ _id: req.params.id }, (errd, orderD) => {
      if (errd) {
        return res.status(499).send({ message: errorhelper.getErrorMessage(errd) });
      } else {
        if (orderD.order_type && orderD.order_type === "Reprocess" && !orderD.billable) {
          return res.send({ success: false, message: "You cannot create invoice for the non billable order." });
        } else {
            async.parallel([
              function (callback) {
                const select = "invoice";
                const condition = { division_id: req.params.division_id };
                const query = DivisionaccountModel.findOne(condition, select);

                query.exec((err, Inv) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, Inv);
                  }
                });
              },
              function (callback) {
                const query = AccountledgerModel.findOne({ division_id: req.params.division_id, type: "INVOICE", default: true });

                query.exec((err, accountledger) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, accountledger);
                  }
                });
              },
              function (callback) {
                const condition = { division_id: req.params.division_id};
                const popselect = "tax_name tax_percentage";
                const sel = "division_id measurement tax_class inter_tax_class invoice_option";
                const query = ProcessModel.find(condition, sel).populate("tax_class", popselect).populate("inter_tax_class", popselect);

                query.exec((err, process) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, process);
                  }
                });
              },
              function (callback) { // Fetch Tax
                const select = "tax_name tax_percentage";
                const condition = { is_deleted: false, is_active: true };
                const query = TaxModel.find(condition, select);

                query.exec((err, Tax) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, Tax);
                  }
                });
              },
              function (callback) { // Fetch State list
                const query = StatelistModel.find({}).sort({ name: "asc" });

                query.exec((err, State) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, State);
                  }
                });
              },
              function (callback) { // Fetch GST Treatment list
                const query = GsttreatmentModel.find({});

                query.exec((err, Gst) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, Gst);
                  }
                });
              },
              function (callback) { // Fetch Delivery details
                const condition = { order_id: req.params.id, customer_id: req.params.customer_id, is_deleted: false, is_active: true};

                DeliveryModel.find(condition, "order_no order_id division_id delivery_no delivery_date outward_data is_return").exec((err, orders) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, orders);
                  }
                });
              },
              function (callback) { // Fetch Customer details
                const condition = { _id: req.params.customer_id };

                CustomerModel.findOne(condition, "name mobile_no address gstin gstTreatment placeofSupply group").exec((err, customer) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, customer);
                  }
                });
              },
              function (callback) { // Fetch division details
                const query = DivisionModel.findOne({ _id: req.params.division_id }, "name placeofSupply");

                query.exec((err, division) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, division);
                  }
                });
              },
            ], (err, results) => { // Compute all results
              if (err) {
                res.status(499).send({ message: errorhelper.getErrorMessage(err) });
                return;
              }
              if (results === null || results[0] === null || results[1] === null || results[2] === null) {
                return res.send({ success: false, message: "Something went wrong please try again later!." });
              } else if (results[0] === null) {
                return res.send({ success: false, message: "Invoice prefix details not found." });
              } else if (results[1] === null) {
                return res.send({ success: false, message: "Invoice receivable ledger details not found." });
              } else if (results[2] === null) {
                return res.send({ success: false, message: "Process details not found" });
              } else if (results[6] === null) {
                return res.send({ success: false, message: "Delivery details not found." });
              } else if (results[7] === null) {
                return res.send({ success: false, message: "Customer details not found." });
              } else if (results[8] === null) {
                return res.send({ success: false, message: "Division details not found." });
              }

              const initData = {};
              initData.Invoice = results[0] || [];
              initData.Invoiceledger = results[1] || [];
              initData.Process = results[2] || [];
              initData.Tax = results[3] || [];
              initData.Statelistdetails = results[4] || [];
              initData.Gsttreatmentdetails = results[5] || [];
              initData.Deliverydetails = results[6] || [];
              initData.Customerdetails = results[7] || [];
              initData.Divisiondetails = results[8] || [];
              initData.Order = orderD;

              return res.send({ success: true, data: initData });
            });
        }
      } 
    });
  }
});

// Fetch order details
router.post("/getjobDetails", (req, res) => {
  if (req.body.jobno && req.body.jobno !== null && req.body.jobno !== "" && req.body.customerid && req.body.customerid !== null && 
          req.body.customerid !== "" && req.session.branch && req.session.branch !== null && req.session.branch !== "") {
    const re = new RegExp(req.body.jobno, "i");
    const condition = { order_no: {$regex: re},
        customer_id: req.body.customerid,
        division_id: req.session.branch,
        order_status: "Invoice and Delivery",
        is_deleted: false,
        is_active: true };
    let select = "order_no order_serial_no order_date division_id customer_id customer_name customer_mobile_no billing_address_line billing_area ";
    select += "billing_city billing_pincode billing_state contactperson order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no ";
    select += "dyeing_dc_date order_status deilvery_status order_type billable received_weight delivered_weight returned_weight ";
    select += "inwards outward_delivery return_delivery contract_outward contract_inward";

    let inwardselect = "inward_no inward_serial_no inward_date division_id order_reference_no customer_id customer_name ";
    inwardselect += "customer_mobile_no inward_data total_weight total_delivered_weight total_returned_weight inward_status";

    OrderModel.find(condition, select).populate("inwards", inwardselect).exec((err, orders) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        } else {
          return res.send({success: true, data: orders});
        }
    });
  }
});

module.exports = router;
