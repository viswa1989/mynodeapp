const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const contractpagelog = require("../../../../app/middlewares/contractpagelog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const OrderModel = require("../../../../app/models/OrderModel");
const ContractinwardModel = require("../../../../app/models/ContractinwardModel");
const OutwardModel = require("../../../../app/models/OutwardModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const VehicledetailModel = require("../../../../app/models/VehicledetailModel");
const DriverdetailModel = require("../../../../app/models/DriverdetailModel");
const mongoose = require("mongoose");

router.post("/save", (req, res) => {
  if (req.body.inwardForm) {
    if (!req.body.inwardForm.inwardData || req.body.inwardForm.inwardData === null || req.body.inwardForm.inwardData === "" ||
    req.body.inwardForm.inwardData.length === 0) {
      return res.send({success: false, message: "Inward details not found"});
    }
    if (req.body.inwardForm.order_id && req.body.inwardForm.order_id !== null && req.body.inwardForm.order_id !== "") {
      OrderModel.findOne({_id: req.body.inwardForm.order_id}).populate("inwards").exec((err, order) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (order && order !== null && order._id) {
          if (order.inwards && order.inwards !== null && order.inwards.length > 0) {
            DivisionaccountModel.findOne({division_id: req.session.branch}, "division_id contract_inward").exec((diverr, Divisionaccount) => {
              if (diverr) {
                res.status(499).send({message: errorhelper.getErrorMessage(diverr)});
              } else if (Divisionaccount && Divisionaccount !== null && Divisionaccount._id && Divisionaccount._id !== "" &&
              Divisionaccount.contract_inward && Divisionaccount.contract_inward.prefix && Divisionaccount.contract_inward.serial_no &&
              Divisionaccount.contract_inward.prefix !== "" && Divisionaccount.contract_inward.serial_no !== "") {
                let newInward = new ContractinwardModel({
                  inward_no: `${Divisionaccount.contract_inward.prefix}${Divisionaccount.contract_inward.serial_no}`,
                  inward_serial_no: Divisionaccount.contract_inward.serial_no,
                  outward_no: req.body.inwardForm.outward_no,
                  outward_id: req.body.inwardForm.outward_id,
                  outward_date: req.body.inwardForm.outward_date,
                  order_no: req.body.inwardForm.order_no,
                  order_id: req.body.inwardForm.order_id,
                  order_date: req.body.inwardForm.order_date,
                  order_reference_no: req.body.inwardForm.order_reference_no,
                  division_id: req.session.branch,
                  customer_id: req.body.inwardForm.customer_id,
                  customer_name: req.body.inwardForm.customer_name,
                  customer_mobile_no: req.body.inwardForm.customer_mobile_no,
                  customer_dc_no: req.body.inwardForm.customer_dc_no,
                  customer_dc_date: req.body.inwardForm.customer_dc_date,
                  contractor_id: req.body.inwardForm.contractor_id,
                  contractor_name: req.body.inwardForm.contractor_name,
                  contractor_mobile_no: req.body.inwardForm.contractor_mobile_no,
                  contractor_address1: req.body.inwardForm.contractor_address1,
                  contractor_address2: req.body.inwardForm.contractor_address2,
                  contractor_pincode: req.body.inwardForm.contractor_pincode,
                  gstin_number: req.body.inwardForm.gstin_number,
                  vehicle_no: req.body.inwardForm.vehicle_no,
                  driver_name: req.body.inwardForm.driver_name,
                  driver_no: req.body.inwardForm.driver_no,
                  inward_data: req.body.inwardForm.inwardData,
                });
                if(req.body.inwardForm.contract_dc_date && req.body.inwardForm.contract_dc_date !== null && req.body.inwardForm.contract_dc_date !== "") {
                  newInward.contract_dc_date = req.body.inwardForm.contract_dc_date;
                }
                if(req.body.inwardForm.contract_delivery_no && req.body.inwardForm.contract_delivery_no !== null && req.body.inwardForm.contract_delivery_no !== "") {
                  newInward.contract_delivery_no = req.body.inwardForm.contract_delivery_no;
                }
                newInward = commonfunction.beforeSave(newInward, req);

                newInward.save((outwarderr, inwards) => {
                  if (outwarderr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
                  } else if (inwards && inwards !== null && inwards._id) {
                    const brquery = {division_id: Divisionaccount.division_id};
                    const vquery = {vehicle_no: req.body.inwardForm.vehicle_no};
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    const driquery = {driver_name: req.body.inwardForm.driver_name};
                    const updatedri = { driver_name: req.body.inwardForm.driver_name, driver_no: req.body.inwardForm.driver_no };

                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"contract_inward.serial_no": 1}}, (brerr, bdata) => {
                      if (brerr) {
                        res.status(499).send({message: errorhelper.getErrorMessage(brerr)});
                      } else if (bdata && bdata !== null && bdata._id) {
                        order.contract_inward.push(inwards._id);
                        OrderModel.findOneAndUpdate({_id: order._id}, order, (ordererr, orderData) => {
                          if (ordererr) {
                            ContractinwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                            res.status(499).send({message: errorhelper.getErrorMessage(ordererr)});
                            return;
                          } else if (orderData && orderData !== null && orderData._id) {
                            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});

                            const obj = {};
                            obj.data = inwards;
                            obj.PAGE = "CONTRACT INWARD";
                            const logdata = contractpagelog.saveInward(obj, req);
                            if (logdata.message && logdata.message !== null) {
                              notificationlog.savelog(logdata, res);
                            }

                            return res.send({success: true, data: inwards});
                          }
                          ContractinwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                          return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                        });
                      } else {
                        ContractinwardModel.findByIdAndRemove(inwards._id, (errrem) => { });
                        return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                      }
                    });
                  } else {
                    return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                  }
                });
              } else {
                return res.send({success: false, message: "Contract inward prefix & serial no not found"});
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
  if (req.body.inwardForm) {
    if (!req.body.inwardForm.inward_data || req.body.inwardForm.inward_data === null || req.body.inwardForm.inward_data === "" ||
    req.body.inwardForm.inward_data.length === 0) {
      return res.send({success: false, message: "Inward details not found"});
    }
    if (req.body.inwardForm.outward_id && req.body.inwardForm.outward_id !== null && req.body.inwardForm.outward_id !== "") {
      OutwardModel.findOne({_id: req.body.inwardForm.outward_id}).exec((oerr, outwards) => {
        if (oerr) {
          res.status(499).send({message: errorhelper.getErrorMessage(oerr)});
        } else if (outwards && outwards !== null && outwards._id) {
          if (outwards.outward_status === "In Progress") {
            ContractinwardModel.findOne({_id: req.body.inwardForm._id}).exec((cerrs, inwarddata) => {
              if (cerrs) {
                res.status(499).send({message: errorhelper.getErrorMessage(cerrs)});
              } else if (inwarddata && inwarddata !== null && inwarddata._id) {
                  
                inwarddata.vehicle_no = req.body.inwardForm.vehicle_no;
                inwarddata.driver_name = req.body.inwardForm.driver_name;
                inwarddata.driver_no = req.body.inwardForm.driver_no;
                inwarddata.inward_data = req.body.inwardForm.inward_data;
                  
                if(req.body.inwardForm.contract_dc_date && req.body.inwardForm.contract_dc_date !== null && req.body.inwardForm.contract_dc_date !== "") {
                  inwarddata.contract_dc_date = req.body.inwardForm.contract_dc_date;
                }
                if(req.body.inwardForm.contract_delivery_no && req.body.inwardForm.contract_delivery_no !== null && req.body.inwardForm.contract_delivery_no !== "") {
                  inwarddata.contract_delivery_no = req.body.inwardForm.contract_delivery_no;
                }
                inwarddata = commonfunction.beforeSave(inwarddata, req);
                
                inwarddata.save((outwarderr, inwards) => {
                  if (outwarderr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
                  } else if (inwards && inwards !== null && inwards._id) {
                    const vquery = {vehicle_no: req.body.inwardForm.vehicle_no};
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    const driquery = {driver_name: req.body.inwardForm.driver_name};
                    const updatedri = { driver_name: req.body.inwardForm.driver_name, driver_no: req.body.inwardForm.driver_no };

                    VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                    DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});

                    const obj = {};
                    obj.data = inwards;
                    obj.PAGE = "CONTRACT INWARD";
                    const logdata = contractpagelog.updateInward(obj, req);
                    if (logdata.message && logdata.message !== null) {
                      notificationlog.savelog(logdata, res);
                    }

                    return res.send({success: true, data: inwards});
                  } else {
                    return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                  }
                });
              } else {
                return res.send({success: false, message: "Inward not found"});
              }
            });
          } else {
            return res.send({success: false, message: "You cannot edit the inward because the outward is in completed status."});
          }
        } else {
          return res.send({success: false, message: "Outward not found"});
        }
      });
    } else {
      return res.send({success: false, message: "Outward details not found"});
    }
  }
});

router.post("/getcontratorInwardstatbydivision", (req, res) => {
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
    const groups = {$group: {_id: {division_id: "$division_id"}, count: {$sum: 1}}};
    const project = {$project: {count: 1, division_id: "$_id.division_id", _id: 0}};
    ContractinwardModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: ords});
    });
  }
});

router.post("/getcontractInward", (req, res) => {
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

    let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_id inward_data ";
    select += "inward_no inward_date division_id contractor_id contractor_name";
    ContractinwardModel.find(condition, select).sort({inward_date: "desc"}).skip(skipdata)
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

router.post("/getcontractInwardstat", (req, res) => {
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
    const groups = {$group: {_id: {division_id: "$division_id"}, count: {$sum: 1}}};
    const project = {$project: {count: 1, division_id: "$_id.division_id", _id: 0}};
    ContractinwardModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        return res.send({success: true, data: ords});
      }
    });
  }
});

router.post("/getcontractInwardbydivision", (req, res) => {
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

    let skipdata = 0;
    let limitdata = 25;
    if (parseInt(req.body.limit) > 0) {
      limitdata = req.body.limit;
    }
    if (req.body.skip && req.body.skip !== null && parseInt(req.body.skip) > 0) {
      skipdata = req.body.skip;
    }

    let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_id inward_data ";
    select += "inward_no inward_date division_id contractor_id contractor_name";

    const query = ContractinwardModel.find(condition, select).sort({ inward_date: "desc" }).skip(skipdata)
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

router.get("/getInwardeditview/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { division_id: req.session.branch,
        is_deleted: false,
        is_active: true };
      condition.contract_inward = mongoose.Types.ObjectId(req.params.id);
              
      let select = "order_no order_serial_no order_date division_id customer_id customer_name customer_mobile_no billing_address_line billing_area ";
      select += "billing_city billing_pincode billing_state contactperson order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no ";
      select += "dyeing_dc_date order_status deilvery_status order_type billable received_weight delivered_weight returned_weight ";
      select += "contract_outward contract_inward";

      let contractoutward = "order_id outward_status outward_data.delivery_roll outward_data.delivery_status outward_data.delivery_weight ";
      contractoutward += "outward_data.inward_data_id outward_data.inward_id outward_data.rolls outward_data.weight outward_data._id";
      
      let contractinward = "order_id outward_id inward_data.received_roll inward_data.inward_status inward_data.received_weight ";
      contractinward += "inward_data.inward_data_id inward_data.inward_id inward_data.rolls inward_data.weight inward_data.outward_data_id";
      
      async.parallel([
        function (callback) { // Fetch Order Details
          const query = OrderModel.findOne(condition, select).populate("contract_outward", contractoutward).populate("contract_inward", contractinward);

          query.exec((err, orders) => {
            if (err) {
              callback(err);
            }
            callback(null, orders);
          });
        },
        function (callback) { // Fetch Contract Inward Details
          const cond = { _id: req.params.id,
            is_deleted: false,
            is_active: true };
          const query = ContractinwardModel.findOne(cond);

          query.exec((err, inwards) => {
            if (err) {
              callback(err);
            }
            callback(null, inwards);
          });
        },
        function (callback) { // Fetch Outward Details
          const condition = { _id: mongoose.Types.ObjectId(req.params.id),
            is_deleted: false,
            is_active: true };
        
          const mtch = { $match: condition };
          const lookup = { $lookup: { from: "outwards", localField: "outward_id", foreignField: "_id", as: "cin" } };
          const grp = {$group: {_id: "$_id",
            outwards: {$push: "$cin"}}};
          const project = {$project: {"outwards": 1}};
          ContractinwardModel.aggregate(lookup, mtch, (er, inwards) => {
            if (er) {
              callback(er);
            }
            callback(null, inwards);
          });
        },
      ], (err, results) => { // Compute all results
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }
        if (!results[0] || results[0] === null || !results[0]._id) {
          return res.send({ success: false, message: "Order details not found for this delivery" });
        }
        if (results[0].order_status && (results[0].order_status === "Completed" || results[0].order_status === "Invoice and Delivery")) {
          return res.send({ success: false, message: "You cannot edit the inward of the "+results[0].order_status+" Order" });
        }
        if (!results[1] || results[1] === null || !results[1]._id) {
          return res.send({ success: false, message: "Inward details not found" });
        }
        if (!results[1] || results[1] === null || !results[1]._id) {
          return res.send({ success: false, message: "Inward details not found" });
        }
        if (!results[2] || results[2] === null || results[2].length === 0) {
          return res.send({ success: false, message: "Outward details not found" });
        }
        if (!results[2][0].cin || results[2][0].cin === null || results[2][0].cin.length === 0) {
          return res.send({ success: false, message: "Outward details not found" });
        }
        if (results[2][0].cin[0].outward_status === "Completed") {
          return res.send({ success: false, message: "You cannot edit the inward of the completed outward" });
        }
        
        const initData = {};
        initData.Order = results[0] || [];
        initData.Inward = results[1] || [];
        initData.Outward = results[2][0].cin[0] || [];

        return res.send({success: true, data: initData});
      });
    } else {
      return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
    }
  }
});

module.exports = router;
