const commonfunction = require("../../../../app/middlewares/commonfunction");
const errorhelper = require("../../../../app/helpers/errorhelper");
const contractpagelog = require("../../../../app/middlewares/contractpagelog");
const ordertracklog = require("../../../../app/middlewares/ordertracklog");
const notificationlog = require("../../../../app/middlewares/notificationlog");
const async = require("async");
const express = require("express");

const router = express.Router();
const OrderModel = require("../../../../app/models/OrderModel");
const OutwardModel = require("../../../../app/models/OutwardModel");
const ContractinwardModel = require("../../../../app/models/ContractinwardModel");
const PreferenceModel = require("../../../../app/models/PreferenceModel");
const DivisionaccountModel = require("../../../../app/models/DivisionaccountModel");
const VehicledetailModel = require("../../../../app/models/VehicledetailModel");
const DriverdetailModel = require("../../../../app/models/DriverdetailModel");
const mongoose = require("mongoose");

router.post("/save", (req, res) => {
  if (req.body.outwardForm) {
    if (!req.body.outwardForm.outwardData || req.body.outwardForm.outwardData === null || req.body.outwardForm.outwardData === "" ||
    req.body.outwardForm.outwardData.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    if (req.body.outwardForm.order_id && req.body.outwardForm.order_id !== null && req.body.outwardForm.order_id !== "") {
      OrderModel.findOne({_id: req.body.outwardForm.order_id}).populate("inwards").exec((err, order) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
        } else if (order && order !== null && order._id) {
          if (order.inwards && order.inwards !== null && order.inwards.length > 0) {
            DivisionaccountModel.findOne({division_id: req.session.branch}, "division_id contract_outward").exec((diverr, Divisionaccount) => {
              if (diverr) {
                res.status(499).send({message: errorhelper.getErrorMessage(diverr)});
              } else if (Divisionaccount && Divisionaccount !== null && Divisionaccount._id && Divisionaccount._id !== "" &&
              Divisionaccount.contract_outward && Divisionaccount.contract_outward.prefix && Divisionaccount.contract_outward.serial_no &&
              Divisionaccount.contract_outward.prefix !== "" && Divisionaccount.contract_outward.serial_no !== "") {
                let newOutward = new OutwardModel({
                  outward_no: `${Divisionaccount.contract_outward.prefix}${Divisionaccount.contract_outward.serial_no}`,
                  outward_serial_no: Divisionaccount.contract_outward.serial_no,
                  order_no: req.body.outwardForm.order_no,
                  order_id: req.body.outwardForm.order_id,
                  order_date: req.body.outwardForm.order_date,
                  order_reference_no: req.body.outwardForm.order_reference_no,
                  division_id: req.session.branch,
                  customer_id: req.body.outwardForm.customer_id,
                  customer_name: req.body.outwardForm.customer_name,
                  customer_mobile_no: req.body.outwardForm.customer_mobile_no,
                  customer_dc_no: req.body.outwardForm.customer_dc_no,
                  customer_dc_date: req.body.outwardForm.customer_dc_date,
                  contractor_id: req.body.outwardForm.contractor_id,
                  contractor_name: req.body.outwardForm.contractor_name,
                  contractor_mobile_no: req.body.outwardForm.contractor_mobile_no,
                  contractor_address1: req.body.outwardForm.contractor_address1,
                  contractor_address2: req.body.outwardForm.contractor_address2,
                  contractor_pincode: req.body.outwardForm.contractor_pincode,
                  gstin_number: req.body.outwardForm.gstin_number,
                  vehicle_no: req.body.outwardForm.vehicle_no,
                  driver_name: req.body.outwardForm.driver_name,
                  driver_no: req.body.outwardForm.driver_no,
                  outward_data: req.body.outwardForm.outwardData,
                  outward_status: "In Progress",
                });

                newOutward = commonfunction.beforeSave(newOutward, req);

                newOutward.save((outwarderr, outwards) => {
                  if (outwarderr) {
                    res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
                  } else if (outwards && outwards !== null && outwards._id) {
                    const brquery = {division_id: Divisionaccount.division_id};
                    const vquery = {vehicle_no: req.body.outwardForm.vehicle_no};
                    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    const driquery = {driver_name: req.body.outwardForm.driver_name};
                    const updatedri = { driver_name: req.body.outwardForm.driver_name, driver_no: req.body.outwardForm.driver_no };

                    DivisionaccountModel.findOneAndUpdate(brquery, {$inc: {"contract_outward.serial_no": 1}}, (brerr, bdata) => {
                      if (brerr) {
                        res.status(499).send({message: errorhelper.getErrorMessage(brerr)});
                      } else if (bdata && bdata !== null && bdata._id) {
                        order.contract_outward.push(outwards._id);
                        OrderModel.findOneAndUpdate({_id: order._id}, order, (ordererr, orderData) => {
                          if (ordererr) {
                            OutwardModel.findByIdAndRemove(outwards._id, (errrem) => { });
                            res.status(499).send({message: errorhelper.getErrorMessage(ordererr)});
                            return;
                          } else if (orderData && orderData !== null && orderData._id) {
                            VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                            DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});

                            const obj = {};
                            obj.data = outwards;
                            obj.PAGE = "CONTRACT OUTWARD";
                            const logdata = contractpagelog.saveOutward(obj, req);
                            if (logdata.message && logdata.message !== null) {
                              notificationlog.savelog(logdata, res);
                            }

                            return res.send({success: true, data: outwards});
                          } else {
                            OutwardModel.findByIdAndRemove(outwards._id, (errrem) => { });
                            return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                          }
                        });
                      } else {
                        OutwardModel.findByIdAndRemove(outwards._id, (errrem) => { });
                        return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                      }
                    });
                  } else {
                    return res.send({success: false, message: "Oops! something went wrong please try again later!."});
                  }
                });
              } else {
                return res.send({success: false, message: "Contract outward prefix & serial no not found"});
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
  if (req.body.outwardForm && req.body.outwardForm._id) {
    if (!req.body.outwardForm.outward_data || req.body.outwardForm.outward_data === null || req.body.outwardForm.outward_data === "" ||
    req.body.outwardForm.outward_data.length === 0) {
      return res.send({success: false, message: "Outward details not found"});
    }
    
    OutwardModel.findOne({_id: req.body.outwardForm._id}).exec((err, deliverydata) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (deliverydata && deliverydata !== null && deliverydata._id) {
        const cond = { outward_id: deliverydata._id,
            is_deleted: false,
            is_active: true };
        const query = ContractinwardModel.find(cond);

        query.exec((errin, inwards) => {
          if (errin) {
            return res.status(499).send({message: errorhelper.getErrorMessage(errin)});
          } else if (inwards && inwards !== null && inwards.length>0) {
            return res.send({success: false, message: "You cannot edit the outward after inward received"});
          } else {
            deliverydata.contractor_id = req.body.outwardForm.contractor_id;
            deliverydata.contractor_name = req.body.outwardForm.contractor_name;
            deliverydata.contractor_mobile_no = req.body.outwardForm.contractor_mobile_no;
            deliverydata.contractor_address1 = req.body.outwardForm.contractor_address1;
            deliverydata.contractor_address2 = req.body.outwardForm.contractor_address2;
            deliverydata.contractor_pincode = req.body.outwardForm.contractor_pincode;
            deliverydata.gstin_number = req.body.outwardForm.gstin_number;
            deliverydata.vehicle_no = req.body.outwardForm.vehicle_no;
            deliverydata.driver_name = req.body.outwardForm.driver_name;
            deliverydata.driver_no = req.body.outwardForm.driver_no;
            deliverydata.outward_data = req.body.outwardForm.outward_data;

            deliverydata = commonfunction.beforeSave(deliverydata, req);

            deliverydata.save((outwarderr, outwards) => {
              if (outwarderr) {
                return res.status(499).send({message: errorhelper.getErrorMessage(outwarderr)});
              } else if (outwards && outwards !== null && outwards._id) {
                const brquery = {division_id: deliverydata.division_id};
                const vquery = {vehicle_no: req.body.outwardForm.vehicle_no};
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                const driquery = {driver_name: req.body.outwardForm.driver_name};
                const updatedri = { driver_name: req.body.outwardForm.driver_name, driver_no: req.body.outwardForm.driver_no };

                VehicledetailModel.findOneAndUpdate(vquery, vquery, options, (veerr) => {});
                DriverdetailModel.findOneAndUpdate(driquery, updatedri, options, (drierr) => {});

                const obj = {};
                obj.data = outwards;
                obj.PAGE = "CONTRACT OUTWARD";
                const logdata = contractpagelog.updateOutward(obj, req);
                if (logdata.message && logdata.message !== null) {
                  notificationlog.savelog(logdata, res);
                }

                return res.send({success: true, data: outwards});
              } else {
                return res.send({success: false, message: "Oops! something went wrong please try again later!."});
              }
            });
          }
        });
      } else {
        return res.send({success: false, message: "Outward not found"});
      }
    });
  }
});

router.get("/getPendingbycontractor/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { contractor_id: mongoose.Types.ObjectId(req.params.id),
        division_id: mongoose.Types.ObjectId(req.session.branch),
        outward_status: "In Progress",
        is_deleted: false,
        is_active: true };

      const lookup = { $lookup: { from: "contractinwards", localField: "_id", foreignField: "outward_id", as: "cin" } };

      const mtch = { $match: condition };
      const srt = { $sort: { outward_date: 1 } };
      const grp = {$group: {_id: "$_id",
        outward_no: {$first: "$outward_no"},
        outward_date: {$first: "$outward_date"},
        order_id: {$first: "$order_id"},
        order_no: {$first: "$order_no"},
        order_reference_no: {$first: "$order_reference_no"},
        order_date: {$first: "$order_date"},
        customer_dc_no: {$first: "$customer_dc_no"},
        customer_dc_date: {$first: "$customer_dc_date"},
        customer_id: {$first: "$customer_id"},
        customer_name: {$first: "$customer_name"},
        customer_mobile_no: {$first: "$customer_mobile_no"},
        outward_data: {$first: "$outward_data"},
        inwards: {$push: "$cin"}}};

      const project = {$project: {"inwards.outward_no": 1,
        "inwards.outward_id": 1,
        "inwards.inward_data": 1,
        "outward_no": 1,
        "outward_date": 1,
        "order_id": 1,
        "order_no": 1,
        "order_reference_no": 1,
        "order_date": 1,
        "customer_dc_no": 1,
        "customer_dc_date": 1,
        "customer_id": 1,
        "customer_name": 1,
        "customer_mobile_no": 1,
        "outward_data.inward_id": 1,
        "outward_data.inward_data_id": 1,
        "outward_data.inward_no": 1,
        "outward_data.inward_date": 1,
        "outward_data.fabric_condition": 1,
        "outward_data._id": 1,
        "outward_data.process": 1,
        "outward_data.fabric_type": 1,
        "outward_data.fabric_color": 1,
        "outward_data.dia": 1,
        "outward_data.lot_no": 1,
        "outward_data.delivery_weight": 1,
        "outward_data.delivery_roll": 1,
        "outward_data.delivery_status": 1}};

      OutwardModel.aggregate(lookup, { $unwind: { path: "$cin", preserveNullAndEmptyArrays: true } }, mtch, grp, project, srt, (er, orders) => {
        if (er) {
          res.status(499).send({ message: errorhelper.getErrorMessage(er) });
          return;
        } else {
          let Orderdata = [];
          async.mapSeries(orders, (outData, callbk) => {
            if (outData !== null && outData.order_id) {
              let obj = outData;
              const condition = { _id: outData.order_id};
              let select = "received_weight delivered_weight returned_weight inwards outward_delivery return_delivery contract_outward contract_inward";

              let inwardselect = "inward_no inward_data total_weight total_delivered_weight total_returned_weight inward_status";

              let outwardselect = "order_id is_return outward_data.delivery_roll outward_data.delivery_status outward_data.delivery_weight ";
              outwardselect += "outward_data.inward_data_id outward_data.inward_id outward_data.fabric_id outward_data.rolls outward_data.weight outward_data._id";

              let contractoutward = "order_id outward_status outward_data.delivery_roll outward_data.delivery_status outward_data.delivery_weight ";
              contractoutward += "outward_data.inward_data_id outward_data.inward_id outward_data.rolls outward_data.weight outward_data._id";
              let contractinward = "order_id outward_id inward_data.received_roll inward_data.inward_status inward_data.received_weight ";
              contractinward += "inward_data.inward_data_id inward_data.inward_id inward_data.rolls inward_data.weight inward_data.outward_data_id";

              OrderModel.findOne(condition, select).populate("inwards", inwardselect).populate("outward_delivery", outwardselect)
                .populate("return_delivery", outwardselect).populate("contract_outward", contractoutward).populate("contract_inward", contractinward)
                .exec((err, order) => {
                  if (err) {
                    callbk(err)
                  } else {
                    if (order !== null) {
                      if (order.inwards && order.inwards !== null && order.inwards.length>0) {
                        obj.inwardData = order.inwards;
                      }
                      if (order.outward_delivery && order.outward_delivery !== null && order.outward_delivery.length>0) {
                        obj.outward_delivery = order.outward_delivery;
                      }
                      if (order.return_delivery && order.return_delivery !== null && order.return_delivery.length>0) {
                        obj.return_delivery = order.return_delivery;
                      }
                      if (order.contract_outward && order.contract_outward !== null && order.contract_outward.length>0) {
                        obj.contract_outward = order.contract_outward;
                      }
                      if (order.contract_inward && order.contract_inward !== null && order.contract_inward.length>0) {
                        obj.contract_inward = order.contract_inward;
                      }
                      Orderdata.push(obj);
                      callbk(null)
                    } else {
                      Orderdata.push(obj);
                      callbk(null)
                    }
                  }
                });
            } else {
              callbk(null)
            }
          }, (ers, resultd) => {
            if (ers) {
              return res.send({ success: false, message: ers });
            }
            return res.send({ success: true, data: Orderdata });
          });
        }        
      });
    }
  }
});

router.post("/getcontractorOutwardstatbydivision", (req, res) => {
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
    OutwardModel.aggregate(matched, groups, project, (err, ords) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      return res.send({success: true, data: ords});
    });
  }
});

router.post("/getcontractOutward", (req, res) => {
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

    let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_data outward_status ";
    select += "division_id contractor_id contractor_name";
    OutwardModel.find(condition, select).sort({outward_date: "desc"}).skip(skipdata)
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

router.post("/getcontractorOutwardstat", (req, res) => {
  if (req.session.branch && req.session.branch !== null && req.session.branch !== "" && req.body.filterby && req.body.filterby !== null) {
    if (req.body.filterby !== "ALL") {
      req.filters = commonfunction.filterformatdateByparam(req.body.filterby);
    }
    const divid = mongoose.Types.ObjectId(req.session.branch);
    async.parallel([
      function (callback) { // Fetch Division Details
        const obj = {is_deleted: false, is_active: true, division_id: divid};
        if (req.body.filterby !== "ALL") {
          obj.outward_date = { $gte: req.filters.startDate, $lte: req.filters.endDate };
        }

        const match = {$match: obj};
        const group = {$group: {_id: "$outward_status", count: {$sum: 1}}};
        //        const project = {$project:{"count": 1,"order_status":"$_id"}};
        OutwardModel.aggregate(match, group, (err, ords) => {
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
      initData.outwardCounts = results[0] || [];

      return res.send({ success: true, data: initData });
    });
  }
});

router.post("/getcontractOutwardbydivision", (req, res) => {
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
    if (req.body.outward_status && req.body.outward_status !== "") {
      condition.outward_status = req.body.outward_status;
    }
    //    if (req.body.immediate_check !== "") {
    //      if (req.body.immediate_check) {
    //        condition.immediate_job = req.body.immediate_check;
    //      }
    //    }
    let skipdata = 0;
    let limitdata = 25;
    if (parseInt(req.body.limit) > 0) {
      limitdata = req.body.limit;
    }
    if (req.body.skip && req.body.skip !== null && parseInt(req.body.skip) > 0) {
      skipdata = req.body.skip;
    }

    let select = "order_id order_no order_reference_no order_date customer_name customer_dc_no outward_no outward_date outward_data outward_status ";
    select += "division_id contractor_id contractor_name";

    const query = OutwardModel.find(condition, select).sort({ outward_date: "desc" }).skip(skipdata)
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

function formatOutwarddata(orders, req, callback) {
  const orderdata = [];
  if(orders && orders !== null && orders._id && orders.outward_data && orders.outward_data!==null && orders.outward_data.length>0) {
    const len = orders.outward_data.length;
    let loopexecuted = 0;
    for (let idata = 0; idata < orders.outward_data.length; idata += 1) {
      if (orders.outward_data[idata] && orders.outward_data[idata] !== null && orders.outward_data[idata]._id && 
              orders.outward_data[idata].delivery_roll && orders.outward_data[idata].delivery_weight) {
        const obj = {};
        obj.outward_id = orders._id;
        obj.outward_data_id = orders.outward_data[idata]._id;
        obj.inward_id = orders.outward_data[idata].inward_id;
        obj.inward_data_id = orders.outward_data[idata].inward_data_id;
        obj.rolls = parseInt(orders.outward_data[idata].delivery_roll);
        obj.weight = parseFloat(orders.outward_data[idata].delivery_weight);
        orderdata.push(obj);
      }
      loopexecuted += 1;
    }
    if (len === loopexecuted) {
      callback(null, orderdata);
    }
  } else {
    callback(null, orderdata);
  }
}

function updateOrderstatus(orders, outwards, callback) {
  let weight = 0;

  if (outwards && outwards !== null && outwards.length > 0) {
    async.mapSeries(outwards, (item, callbk) => {
      if (item.inward_data && item.inward_data !== null && item.inward_data.length > 0) {
        async.forEachSeries(item.inward_data, (odata, callb) => {
          if (odata && odata.inward_id && odata.inward_data_id && odata.outward_data_id && odata.received_roll && 
                  orders.inward_id.equals(odata.inward_id) && orders.inward_data_id.equals(odata.inward_data_id) && 
                  orders.outward_data_id.equals(odata.outward_data_id)) {
            weight += parseFloat(odata.received_weight);
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
  if (req.body._id && req.body._id !== null && req.body._id !== "" && req.body.outward_status &&
    req.body.outward_status !== null && req.body.outward_status !== "") {
    const condition = { _id: req.body._id };
    const query = OutwardModel.findOne(condition);

    query.exec((erd, outwards) => {
      if (erd) {
        return res.status(499).send({ message: errorhelper.getErrorMessage(erd) });
      } else if (outwards && outwards !== null && outwards._id) {
        const outwid = mongoose.Types.ObjectId(req.body._id);
        ContractinwardModel.find({outward_id: outwid, is_deleted: false, is_active: true}).exec((recer, recdata) => {
          if(recer){
            return res.status(499).send({ message: errorhelper.getErrorMessage(recer) });
          } else if (recdata && recdata !== null && recdata.length>0) {
            OrderModel.findOne({_id: outwards.order_id}).exec((orderr, orders) => {
              if (orderr) {
                return res.status(499).send({ message: errorhelper.getErrorMessage(orderr) });
              } else if (orders && orders !== null && orders._id) {
                if(orders.order_status){
                  if(orders.order_status === "New Order" || orders.order_status === "In Progress") {
                    if (req.body.outward_status === "Completed") {
                        
                      let weight_diffallowed = 10;
                      PreferenceModel.findOne({ module: "Delivery", preference: "weight_difference_percentage", is_deleted: false }, (err, data) => {
                        if (data && data !== null && data._id && data.value && data.value !== "" && parseInt(data.value) > 0) {
                          weight_diffallowed = parseInt(data.value);
                        }
                        formatOutwarddata(outwards, req, (orderr, ordData) => {
                          if (ordData && ordData !== null && ordData.length > 0) {
                            let receivedweight = 0;
                            let receivedDetails = [];
                            if (recdata && recdata !== null && recdata.length > 0) {
                              receivedDetails = recdata;
                            }
                            
                            async.mapSeries(ordData, (orderData, callbk) => {
                              const inwwt = parseFloat(orderData.weight);
                              updateOrderstatus(orderData, receivedDetails, (errs, rdata) => {
                                if (rdata !== null && rdata !== "" && parseFloat(rdata) > 0) {
                                  const orddiff = ((parseFloat(rdata) - parseFloat(inwwt)) / parseFloat(inwwt)) * 100;
                                  receivedweight += parseFloat(rdata);
                                  if (orddiff <= weight_diffallowed && orddiff >= (-1 * weight_diffallowed)) {
                                    callbk(null, receivedweight);
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
                              outwards = commonfunction.beforeSave(outwards, req);
                              outwards.outward_status = req.body.outward_status;

                              OutwardModel.findByIdAndUpdate(outwards._id, outwards, (errs, orderdata) => {
                                if (errs) {
                                  res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                                } else if (orderdata && orderdata !== null && orderdata._id) {
                                  const obj = {};
                                  obj.data = orderdata;
                                  const logdata = ordertracklog.updateoutwardStatus(obj, req);
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
                    } else {
                      outwards = commonfunction.beforeSave(outwards, req);
                      outwards.outward_status = req.body.outward_status;

                      OutwardModel.findByIdAndUpdate(outwards._id, outwards, (errs, orderdata) => {
                        if (errs) {
                          res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                          return;
                        } else if (orderdata && orderdata !== null && orderdata._id) {
                          const obj = {};
                          obj.data = orderdata;
                          const logdata = ordertracklog.updateoutwardStatus(obj, req);
                          if (logdata.message && logdata.message !== null) {
                            notificationlog.savelog(logdata, res);
                          }

                          return res.send({ success: true, message: "Outward status updated successfully!", data: orderdata });
                        }
                        return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                      });
                    }
                  } else {
                    return res.send({ success: false, message: "You cant update the contract outward status for completed orders." });
                  }
                } else {
                  return res.send({ success: false, message: "Oops! something went wrong please try again later!." });
                }
              } else {
                return res.send({ success: false, message: "Order not found." });
              }
            });
          } else {
            return res.send({ success: false, message: "You cannot change the outward status to completed without inward." });
          }
        });
      } else {
        return res.send({ success: false, message: "Outward not found." });
      }
    });
  }
});

router.get("/getOutwardeditview/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.session.branch && req.session.branch !== null && req.session.branch !== "") {
      const condition = { division_id: req.session.branch,
        is_deleted: false,
        is_active: true };
      condition.contract_outward = mongoose.Types.ObjectId(req.params.id);
              
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
          const query = OutwardModel.findOne(cond);

          query.exec((err, delivery) => {
            if (err) {
              callback(err);
            }
            callback(null, delivery);
          });
        },
        function (callback) { // Fetch Division Details
          const cond = { outward_id: mongoose.Types.ObjectId(req.params.id),
            is_deleted: false,
            is_active: true };
          const query = ContractinwardModel.find(cond);

          query.exec((err, inwards) => {
            if (err) {
              callback(err);
            }
            callback(null, inwards);
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
          return res.send({ success: false, message: "You cannot edit the outward of the "+results[0].order_status+" Order" });
        }
        if (!results[1] || results[1] === null && !results[1]._id) {
          return res.send({ success: false, message: "Outward details not found" });
        }
        if (results[2] && results[2] !== null && results[2].length>0) {
          return res.send({ success: false, message: "You cannot edit the outward after inward received." });
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
