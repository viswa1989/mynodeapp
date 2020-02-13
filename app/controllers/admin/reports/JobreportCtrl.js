const errorhelper = require("../../../../app/helpers/errorhelper");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const mongoose = require("mongoose");
const async = require("async");
const express = require("express");

const router = express.Router();
const OrderModel = require("../../../../app/models/OrderModel");
const DeliveryModel = require("../../../../app/models/DeliveryModel");
const _ = require('underscore');
const excel = require("exceljs");

function Jobcardstatement(req, res, callback) {
  req.filters = commonfunction.filterBydate(req.body.filterData.FromDate, req.body.filterData.ToDate);
  const obj = {is_deleted: false};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  obj.order_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
  
  if (req.body.filterData && req.body.filterData.order_status && req.body.filterData.order_status !== "" && 
          req.body.filterData.order_status !== null && req.body.filterData.order_status.length>0) {
    obj.order_status = {$in: req.body.filterData.order_status};
  }
  if (req.body.filterData && req.body.filterData.immediate_check !== "") {
    if (req.body.filterData.immediate_check) {
      obj.immediate_job = req.body.filterData.immediate_check;
    }
  }
  if (req.body.filterData && req.body.filterData.searchtext && req.body.filterData.searchtext !== "") {
    const re = new RegExp(req.body.filterData.searchtext, "i");
    obj.$or = [{customer_name: {$regex: re}},
      {$where: `function() { return this.customer_mobile_no.toString().match(/${req.body.filterData.searchtext}/) !== null; }`}];
  }
  let skipdata = 0;
  let limitdata = 50;
  if (req.body.filterData.limit && req.body.filterData.limit !== null && parseInt(req.body.filterData.limit) > 0) {
    limitdata = req.body.filterData.limit;
  }
  if (req.body.filterData.skip && req.body.filterData.skip !== null && parseInt(req.body.filterData.skip) > 0) {
    skipdata = req.body.filterData.skip;
  }
  
  let select = "order_no division_id customer_id customer_name customer_mobile_no order_status order_date inwards immediate_job ";
  select += "customer_dc_no order_reference_no customer_dc_date";
  let inwsel = "_id inward_no inward_date inward_data.process inward_data.fabric_type inward_data.fabric_color inward_data.dia ";
  inwsel += "inward_data.rolls inward_data.weight total_weight inward_data.lot_no";
  
  let inwarcnd = {};
  if (req.body.filterData && req.body.filterData.process && req.body.filterData.process !== "" && 
          req.body.filterData.process !== null && req.body.filterData.process.length>0) {
    inwarcnd = {'inward_data.process.process_id' : {$in: req.body.filterData.process} };
  }
  
  const query = OrderModel.find(obj, select).populate("division_id", "name").populate("inwards", inwsel, inwarcnd).sort({ order_date: "desc" });

  query.exec((err, order) => {
    if (err) {
      callback(err, order);
    } else {
      const orders = _.filter(order,function (value) {
                          return value.inwards!==null && value.inwards.length>0;
                        });
      formatInwarddata(orders, req.body, (orderr, ordData) => {
        callback(err, ordData);
      });      
    }
  });
}

router.post("/getJobcardstatement", (req, res) => {
  Jobcardstatement(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else {
      return res.send({ success: true, data: orders });
    }
  });
});

router.post("/getJobcardprintstatement", (req, res) => {
  Jobcardstatement(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else {
      return res.send({ success: true, data: orders });
    }
  });
});

function formatOrders(orders, callback) {
  let deliverydata = [];

  if (orders && orders !== null && orders.length > 0) {
      
    async.mapSeries(orders, (item, callbk) => {
        
      if (item._id !== null && item.outward_data && item.outward_data !== null && item.outward_data.length > 0) {           
          
        async.forEachSeries(item.outward_data, (odata, callb) => {
            
          let outwardDetail = odata;
          outwardDetail.is_return = item._id;
          deliverydata.push(outwardDetail);
          callb(null, outwardDetail);
        }, (err) => {
          callbk(null, deliverydata);
        });
      } else {
        callbk(null, item);
      }
    }, (err) => {
      callback(null, deliverydata);
    });
  } else {
    callback(null, deliverydata);
  }
}

function formatInwarddata(orders, filter, callback) {
  if (filter.filterData && filter.filterData.process && filter.filterData.process !== "" && 
          filter.filterData.process !== null && filter.filterData.process.length>0) {
    let orderData = [];

    if (orders && orders !== null && orders.length > 0) {
      
      async.mapSeries(orders, (ordata, callbk) => {
        if (ordata && ordata !== null && ordata._id && ordata.inwards) {
          let objdata = JSON.parse(JSON.stringify(ordata));
          objdata.inwards[0].inward_data = [];
          async.forEachSeries(ordata.inwards[0].inward_data, (odata, callb) => {

            let outdt = _.filter(odata.process, function(val){                  
                  return _.some(this,function(val2){
                      return _.isEqual(mongoose.Types.ObjectId(val2), mongoose.Types.ObjectId(val.process_id));
                  });
              }, filter.filterData.process);
            if(outdt !== null && outdt.length>0) {
              objdata.inwards[0].inward_data.push(odata);
            }
            callb(null, objdata);
          }, (err) => {
            if(objdata.inwards[0].inward_data.length>0) {
                orderData.push(objdata);
            }
            callbk(null, objdata);
          });
        } else {
          callbk(null, ordata);
        }
      }, (err) => {
        callback(null, orderData);
      });
    } else {
      callback(null, orders);
    }
        
  } else {
    callback(null, orders);
  }
}

function Pendingdelivery(req, res, callback) {
  req.filters = commonfunction.filterBydate(req.body.filterData.FromDate, req.body.filterData.ToDate);
  const obj = {is_deleted: false};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  obj.order_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
  
  if (req.body.filterData && req.body.filterData.order_status && req.body.filterData.order_status !== "" && 
          req.body.filterData.order_status !== null && req.body.filterData.order_status.length>0) {
    obj.order_status = {$in: req.body.filterData.order_status};
  } else {
    obj.order_status = {$nin: ["Completed", "Invoice and Delivery"]};
  }
  if (req.body.filterData && req.body.filterData.immediate_check !== "") {
    if (req.body.filterData.immediate_check) {
      obj.immediate_job = req.body.filterData.immediate_check;
    }
  }
  if (req.body.filterData && req.body.filterData.searchtext && req.body.filterData.searchtext !== "") {
    const re = new RegExp(req.body.filterData.searchtext, "i");
    obj.$or = [{customer_name: {$regex: re}},
      {$where: `function() { return this.customer_mobile_no.toString().match(/${req.body.filterData.searchtext}/) !== null; }`}];
  }
  let inwarcnd = {};
  if (req.body.filterData && req.body.filterData.process && req.body.filterData.process !== "" && 
          req.body.filterData.process !== null && req.body.filterData.process.length>0) {
    inwarcnd = {'inward_data.process.process_id' : {$in: req.body.filterData.process} };
  }
  
  let select = "order_no division_id customer_id customer_name customer_mobile_no order_status order_date inwards immediate_job ";
  select += "customer_dc_no order_reference_no customer_dc_date";
  let inwsel = "_id inward_no inward_date inward_data.process inward_data.fabric_type inward_data.fabric_color inward_data.dia ";
  inwsel += "inward_data.rolls inward_data.weight total_weight inward_data.lot_no inward_data._id";
  let sortData = {order_date: "asc"};
  if (req.body.filterData && req.body.filterData.sortColumn && req.body.filterData.sortColumn !== "") {
    if (req.body.filterData.sortColumn === "customer_name") {
      sortData = {customer_name: req.body.filterData.sortBy};
    }
    if (req.body.filterData.sortColumn === "order_date") {
      sortData = {order_date: req.body.filterData.sortBy};
    }
  }
  
  const query = OrderModel.find(obj, select).populate("division_id", "name").populate("inwards", inwsel, inwarcnd).sort(sortData);
  
  query.exec((err, orderDetail) => {
    if (err) {
      callback(err, orderDetail);
    } else {
      const orders = _.filter(orderDetail,function (value) {
                        return value.inwards!==null && value.inwards.length>0;
                    });
      formatInwarddata(orders, req.body, (orderr, ordData) => {
        if (ordData && ordData !== null && ordData.length>0) {
          let orderData = [];
          const seldata = "outward_data.inward_id outward_data.inward_data_id outward_data.delivery_roll outward_data.delivery_weight";
          async.mapSeries(ordData, (ordata, cb) => {
            if (ordata && ordata !== null && ordata._id && ordata.inwards) {
              let objdata = JSON.parse(JSON.stringify(ordata));
              objdata.inwards[0].inward_data = [];

              const obj = {};
              obj.order_id = mongoose.Types.ObjectId(ordata._id);
              obj.is_deleted = false;

              const match = {$match: obj};

              const group1 = { $group: { _id: "$is_return", outward_data: { "$addToSet": "$outward_data" } } };

              const unwindgrp = { $unwind: "$outward_data" };

              const group2 = { $group: { _id: "$_id", outward_data: { "$addToSet": "$outward_data" }}};

              DeliveryModel.aggregate(match, group1, unwindgrp, unwindgrp, group2).exec((errs, delData) => {
                  if (errs) {
                      cb(errs, delData);
                  } else {
                    if (delData && delData !== null && delData.length>0 && delData[0] && delData[0] !== null && delData[0].outward_data && 
                            delData[0].outward_data.length>0) {

                      formatOrders(delData, (orderr, ordData) => {

                        async.forEachSeries(ordata.inwards[0].inward_data, (indata, callbk) => {        
                          let inwarddetails = JSON.parse(JSON.stringify(indata));
                          inwarddetails.delivered_weight = 0;
                          inwarddetails.returned_weight = 0;
                          inwarddetails.balance_weight = parseFloat(inwarddetails.weight);

                          async.forEachSeries(ordData, (outdata, calbk) => {                                
                            if (outdata && outdata !== null && outdata.inward_id && outdata.inward_data_id && outdata.inward_id.equals(ordata.inwards[0]._id) && 
                                    outdata.inward_data_id.equals(indata._id)) {
                              if (outdata.is_return)  {
                                inwarddetails.returned_weight += parseFloat(outdata.delivery_weight);
                              } else {
                                inwarddetails.delivered_weight += parseFloat(outdata.delivery_weight);
                              }
                              calbk(null);
                            } else {
                              calbk(null);
                            }
                          }, (err, result) => {
                            inwarddetails.balance_weight -= parseFloat(inwarddetails.delivered_weight);
                            inwarddetails.balance_weight -= parseFloat(inwarddetails.returned_weight);

                            objdata.inwards[0].inward_data.push(inwarddetails);
                            callbk(null);
                          });
                        }, (erd, res) => {
                            orderData.push(objdata);
                            cb(null, delData);
                        });
                      });
                    } else {
                      async.forEachSeries(ordata.inwards[0].inward_data, (indata, callbk) => {        
                        let inwarddetails = JSON.parse(JSON.stringify(indata));
                        inwarddetails.delivered_weight = 0;
                        inwarddetails.returned_weight = 0;
                        inwarddetails.balance_weight = parseFloat(inwarddetails.weight);
                        objdata.inwards[0].inward_data.push(inwarddetails);
                        callbk(null);
                      }, (erd, res) => {
                          orderData.push(objdata);
                          cb(null, delData);
                      });
                    }
                  }
              });
            } else {
              cb(null, null);
            }             
          }, (errd, results) => {
              callback(null, orderData);
          });
        } else {
          callback(null, orders);
        }
      });
    }
  });
}

router.post("/getPendingdeliverystatement", (req, res) => {
  Pendingdelivery(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else {
      return res.send({ success: true, data: orders });
    }
  });
});

router.post("/getPendingdeliveryprintstatement", (req, res) => {
  Pendingdelivery(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else {
      return res.send({ success: true, data: orders });
    }
  });
});

function Deliverystatement(req, res, callback) {
  req.filters = commonfunction.filterBydate(req.body.filterData.FromDate, req.body.filterData.ToDate);

  const condition = {is_deleted: false, is_active: true};
  if (req.body.filterData.deliverytype === "RETURN") {
    condition.is_return = true;
  } else {
    condition.is_return = false;
  }
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    condition.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    condition.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  condition.delivery_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
  if (req.body.filterData && req.body.filterData.searchtext && req.body.filterData.searchtext !== "") {
    const re = new RegExp(req.body.filterData.searchtext, "i");
    condition.$or = [{customer_name: {$regex: re}},
        {$where: `function() { return this.customer_mobile_no.toString().match(/${req.body.filterData.searchtext}/) !== null; }`}];
  }

  let skipdata = 0;
  let limitdata = 25;
  if (req.body.filterData.limit && req.body.filterData.limit !== null && parseInt(req.body.filterData.limit) > 0) {
    limitdata = req.body.filterData.limit;
  }
  if (req.body.filterData.skip && req.body.filterData.skip !== null && parseInt(req.body.filterData.skip) > 0) {
    skipdata = req.body.filterData.skip;
  }

  let select = "order_id order_no customer_name customer_mobile_no order_date delivery_no delivery_date is_return division_id ";
  select += "outward_data.process outward_data.fabric_type outward_data.fabric_color outward_data.dia outward_data.rolls ";
  select += "outward_data.weight outward_data.delivery_weight outward_data.lot_no";
  const inwsel = "customer_dc_no order_reference_no customer_dc_date";

  const query = DeliveryModel.find(condition, select).populate("division_id", "name").populate("order_id", inwsel).sort({delivery_date: "desc"});

  query.exec((err, orders) => {
    if (err) {
      callback(err, orders);
    } else {
      callback(null, orders);
    }
  });
}

router.post("/getDeliverystatement", (req, res) => {
  if (req.body.filterData && req.body.filterData !== null && req.body.filterData.deliverytype &&
            (req.body.filterData.deliverytype === "OUTWARD" || req.body.filterData.deliverytype === "RETURN")) {
    Deliverystatement(req, res, (errs, orders) => {
      if (errs) {
        res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
        return;
      } else {
        return res.send({ success: true, data: orders });
      }
    });
  }
});

router.post("/getDeliveryprintstatement", (req, res) => {
  if (req.body.filterData && req.body.filterData !== null && req.body.filterData.deliverytype &&
            (req.body.filterData.deliverytype === "OUTWARD" || req.body.filterData.deliverytype === "RETURN")) {
    Deliverystatement(req, res, (errs, orders) => {
      if (errs) {
        res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
        return;
      } else {
        return res.send({ success: true, data: orders });
      }
    });
  }
});

function writeJobcarddata(orders, callback) {
  let orderdata = [];
  let len = 0;
  let customer_totweight = 0;
  let totweight = 0;
  
  async.mapSeries(orders, (orderdt, calbak) => {
    
    let orderdtexist = false
    async.forEachSeries(orderdt.inwards[0].inward_data, (inwards, calbk) => {        
      if (inwards && inwards !== null && inwards.process) {
        const ord = {};
        
        if (!orderdtexist) {
          ord.division = orderdt.division_id.name;
          ord.order_no = orderdt.order_no;
          ord.order_date = new Date(orderdt.order_date);
          ord.customer_name = orderdt.customer_name;
          ord.order_status = orderdt.order_status;
          ord.order_reference_no = orderdt.order_reference_no;
          ord.customer_dc_no = orderdt.customer_dc_no;
          ord.customer_dc_date = new Date(orderdt.customer_dc_date);
          if (orderdt.immediate_job) {
            ord.priority = "Immediate";
          } else {
            ord.priority = "Normal";
          }
          orderdtexist = true;
        }
        
        ord.fabric = inwards.fabric_type;
        ord.colour = inwards.fabric_color;
        ord.lot_no = inwards.lot_no;
        ord.dia = inwards.dia;
        ord.rolls = inwards.rolls;
        ord.weight = inwards.weight;
        customer_totweight = customer_totweight + parseFloat(inwards.weight);
        totweight = totweight + parseFloat(inwards.weight);
        
        const prodata = _.flatten(_.pluck(inwards.process, "process_name"));
        ord.process = prodata.map((elem) => {
          return elem;
        }).join(", ");
        
        orderdata.push(ord);
        calbk(null);
      } else {
        calbk(null);
      }
    }, (err, result) => {        
//        const ords = {};
//        ords.dia = "Total";
//        ords.weight = orderdt.inwards[0].total_weight;
        
//        orderdata.push(ords);
        const cusgrd = {};
        cusgrd.dia = "Order Total Weight";
        cusgrd.weight = customer_totweight;
        orderdata.push(cusgrd);
        customer_totweight = 0;
          
        len += 1;
        calbak(null);
    });
  }, (errd, results) => {
    const grd = {};
    grd.dia = "Net Total";
    grd.weight = totweight;
    orderdata.push(grd);
        
    callback(null, orderdata);
  });
}

router.post("/exportjobcardreport", (req, res) => {
  let reportheader = "JOB CARD STATEMENT";
  if (req.body.filterData.FromDate && req.body.filterData.FromDate !== null && req.body.filterData.FromDate !== "" && 
          req.body.filterData.ToDate && req.body.filterData.ToDate !== null && req.body.filterData.ToDate !== "") {
    if (req.body.filterData.FromDate === req.body.filterData.ToDate) {
      reportheader += ` - (${req.body.filterData.FromDate})`;
    } else {
      reportheader += ` - (${req.body.filterData.FromDate} to ${req.body.filterData.ToDate})`;
    }
  }
  
  let workbook1 = new excel.Workbook();
  workbook1 = commonfunction.excelexportinfo(workbook1, req);

  let sheet1 = workbook1.addWorksheet('Sheet1');
  
  sheet1.mergeCells('A1', 'P2');
  sheet1.getCell('A1').value = reportheader;
  
  sheet1.getRow(3).values = commonfunction.exceljobcardheader();
  sheet1.columns = commonfunction.exceljobcardids();
  sheet1.getRow(1).font = {name: 'Calibri', 'size': 14, bold: true };
  
  sheet1.getRow(3).font = {name: 'Calibri', 'size': 12, bold: true };
  sheet1.getColumn(1).alignment = { vertical: 'justify' };
  sheet1.getColumn(2).alignment = { vertical: 'justify' };
  sheet1.getColumn(3).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(4).alignment = { vertical: 'justify' };
  sheet1.getColumn(5).alignment = { vertical: 'justify' };
  sheet1.getColumn(6).alignment = { vertical: 'justify' };
  sheet1.getColumn(7).alignment = { vertical: 'justify' };
  sheet1.getColumn(8).alignment = { vertical: 'justify' };
  sheet1.getColumn(9).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(10).alignment = { vertical: 'justify' };
  sheet1.getColumn(11).alignment = { vertical: 'justify' };
  sheet1.getColumn(12).alignment = { vertical: 'justify' };
  sheet1.getColumn(13).alignment = { vertical: 'justify', horizontal: 'center' };
  sheet1.getColumn(14).alignment = { vertical: 'justify' };
  sheet1.getColumn(15).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(16).alignment = { vertical: 'justify', horizontal: 'right' };
  
  sheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(9).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(16).numFmt = '0.000';
  sheet1.getCell('A1').alignment = { vertical: 'justify', horizontal: 'center' };
  
  const filename = `Jobcardreport_${Date.now()}.xlsx`;
  const responsepath = `Uploads/export_files/${filename}`;
  const filePath = `./public/${responsepath}`;
  
  Jobcardstatement(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else if (orders && orders !== null  && orders.length>0) {
      writeJobcarddata(orders, (err, orderData) => {
          sheet1.addRows(orderData);
          workbook1.xlsx.writeFile(filePath).then(function(erdata) {
            return res.send({success: true, data: responsepath});
          });
      });
    } else {
      return res.send({ success: false, message: "No data available" });
    }
  });  
});

function writePendingdeliverydata(orders, callback) {
  let orderdata = [];
  let len = 0;
  let customer_totweight = 0;
  let customer_totdel = 0;
  let customer_totret = 0;
  let totweight = 0;
  let totdel = 0;
  let totret = 0;
  
  async.mapSeries(orders, (orderdt, calbak) => {
    
    let orderdtexist = false
    async.forEachSeries(orderdt.inwards[0].inward_data, (inwards, calbk) => {        
      if (inwards && inwards !== null && inwards.process) {
        const ord = {};
        
        if (!orderdtexist) {
          ord.division = orderdt.division_id.name;
          ord.order_no = orderdt.order_no;
          ord.order_date = new Date(orderdt.order_date);
          ord.customer_name = orderdt.customer_name;
          ord.order_status = orderdt.order_status;
          ord.order_reference_no = orderdt.order_reference_no;
          ord.customer_dc_no = orderdt.customer_dc_no;
          ord.customer_dc_date = new Date(orderdt.customer_dc_date);
          if (orderdt.immediate_job) {
            ord.priority = "Immediate";
          } else {
            ord.priority = "Normal";
          }
          orderdtexist = true;
        }
        
        ord.fabric = inwards.fabric_type;
        ord.colour = inwards.fabric_color;
        ord.lot_no = inwards.lot_no;
        ord.dia = inwards.dia;
        ord.rolls = inwards.rolls;
        ord.weight = inwards.weight;
        ord.delivered_weight = inwards.delivered_weight;
        ord.returned_weight = inwards.returned_weight;
        ord.balance_weight = inwards.balance_weight;
        
        customer_totweight += parseFloat(inwards.weight);
        totweight += parseFloat(inwards.weight);
        customer_totdel += parseFloat(inwards.delivered_weight);
        totdel += parseFloat(inwards.delivered_weight);
        customer_totret += parseFloat(inwards.returned_weight);
        totret += parseFloat(inwards.returned_weight);
        
        const prodata = _.flatten(_.pluck(inwards.process, "process_name"));
        ord.process = prodata.map((elem) => {
          return elem;
        }).join(", ");
        
        orderdata.push(ord);
        calbk(null);
      } else {
        calbk(null);
      }
    }, (err, result) => {
//        const ords = {};
//        ords.dia = "Total";
//        ords.weight = orderdt.inwards[0].total_weight;
//        orderdata.push(ords);
        if (!orders[len+1] || (orders[len+1] && orders[len+1].customer_id !== orderdt.customer_id)) {
          const cusgrd = {};
          cusgrd.dia = "Customer Wise Total";
          cusgrd.weight = customer_totweight;
          cusgrd.delivered_weight = customer_totdel;
          cusgrd.returned_weight = customer_totret;
          orderdata.push(cusgrd);
          customer_totweight = 0;
          customer_totdel = 0;
          customer_totret = 0;
        }
        len += 1;
        calbak(null);
    });
  }, (errd, results) => {
    const grd = {};
    grd.dia = "Net Total";
    grd.weight = totweight;
    grd.delivered_weight = totdel;
    grd.returned_weight = totret;
    orderdata.push(grd);
    
    callback(null, orderdata);
  });
}

router.post("/exportpendingdelivery", (req, res) => {
  let reportheader = "PENDING DELIVERIES";
  if (req.body.filterData.FromDate && req.body.filterData.FromDate !== null && req.body.filterData.FromDate !== "" && 
          req.body.filterData.ToDate && req.body.filterData.ToDate !== null && req.body.filterData.ToDate !== "") {
    if (req.body.filterData.FromDate === req.body.filterData.ToDate) {
      reportheader += ` - (${req.body.filterData.FromDate})`;
    } else {
      reportheader += ` - (${req.body.filterData.FromDate} to ${req.body.filterData.ToDate})`;
    }
  }
  
  let workbook1 = new excel.Workbook();
  workbook1 = commonfunction.excelexportinfo(workbook1, req);

  let sheet1 = workbook1.addWorksheet('Sheet1');
  
  sheet1.mergeCells('A1', 'S2');
  sheet1.getCell('A1').value = reportheader;
  
  sheet1.getRow(3).values = commonfunction.excelpendingdeliveryheader();
  sheet1.columns = commonfunction.excelpendingdeliveryids();
  sheet1.getRow(1).font = {name: 'Calibri', 'size': 14, bold: true };
  
  sheet1.getRow(3).font = {name: 'Calibri', 'size': 12, bold: true };
  sheet1.getColumn(1).alignment = { vertical: 'justify' };
  sheet1.getColumn(2).alignment = { vertical: 'justify' };
  sheet1.getColumn(3).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(4).alignment = { vertical: 'justify' };
  sheet1.getColumn(5).alignment = { vertical: 'justify' };
  sheet1.getColumn(6).alignment = { vertical: 'justify' };
  sheet1.getColumn(7).alignment = { vertical: 'justify' };
  sheet1.getColumn(8).alignment = { vertical: 'justify' };
  sheet1.getColumn(9).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(10).alignment = { vertical: 'justify' };
  sheet1.getColumn(11).alignment = { vertical: 'justify' };
  sheet1.getColumn(12).alignment = { vertical: 'justify' };
  sheet1.getColumn(13).alignment = { vertical: 'justify', horizontal: 'center' };
  sheet1.getColumn(14).alignment = { vertical: 'justify' };
  sheet1.getColumn(15).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(16).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(17).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(18).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(19).alignment = { vertical: 'justify', horizontal: 'right' };
  
  sheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(9).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(16).numFmt = '0.000';
  sheet1.getColumn(17).numFmt = '0.000';
  sheet1.getColumn(18).numFmt = '0.000';
  sheet1.getColumn(19).numFmt = '0.000';
  sheet1.getCell('A1').alignment = { vertical: 'justify', horizontal: 'center' };
  
  const filename = `Pendingdeliveryreport_${Date.now()}.xlsx`;
  const responsepath = `Uploads/export_files/${filename}`;
  const filePath = `./public/${responsepath}`;
  
  Pendingdelivery(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else if (orders && orders !== null  && orders.length>0) {
      writePendingdeliverydata(orders, (err, orderData) => {
          sheet1.addRows(orderData);
          workbook1.xlsx.writeFile(filePath).then(function(erdata) {
            return res.send({success: true, data: responsepath});
          });
      });
    } else {
      return res.send({ success: false, message: "No data available" });
    }
  });  
});

function writeDeliverydata(orders, callback) {
  let deliverydata = [];
  let totdel = 0;
  async.mapSeries(orders, (orderdt, calbak) => {
    
    let orderdtexist = false
    async.forEachSeries(orderdt.outward_data, (outwards, calbk) => {        
      if (outwards && outwards !== null && outwards.process) {
        const ord = {};
        
        if (!orderdtexist) {
          ord.division = orderdt.division_id.name;
          ord.delivery_no = orderdt.delivery_no;
          ord.delivery_date = new Date(orderdt.delivery_date);
          ord.order_no = orderdt.order_no;
          ord.order_date = new Date(orderdt.order_date);
          ord.customer_name = orderdt.customer_name;
          ord.order_reference_no = orderdt.order_id.order_reference_no;
          ord.customer_dc_no = orderdt.order_id.customer_dc_no;
          ord.customer_dc_date = orderdt.order_id.customer_dc_date;
          orderdtexist = true;
        }
        
        ord.fabric = outwards.fabric_type;
        ord.colour = outwards.fabric_color;
        ord.lot_no = outwards.lot_no;
        ord.dia = outwards.dia;
        ord.rolls = outwards.rolls;
        ord.weight = outwards.weight;
        ord.delivery_weight = outwards.delivery_weight;
        totdel += parseFloat(outwards.delivery_weight);
        
        const prodata = _.flatten(_.pluck(outwards.process, "process_name"));
        ord.process = prodata.map((elem) => {
          return elem;
        }).join(", ");
        
        deliverydata.push(ord);
        calbk(null);
      } else {
        calbk(null);
      }
    }, (err, result) => {
        calbak(null);
    });
  }, (errd, results) => {
    const del = {};
    del.dia = "Net Total";
    del.delivery_weight = totdel;
    deliverydata.push(del);
    
    callback(null, deliverydata);
  });
}

router.post("/exportdeliveryreport", (req, res) => {
  let reportheader = "DELIVERY STATEMENT";
  if (req.body.filterData.deliverytype === "RETURN") {
    reportheader = "RETURN DELIVERY STATEMENT";
  }
  const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  if (req.body.filterData.FromDate && req.body.filterData.FromDate !== null && req.body.filterData.FromDate !== "" && 
          req.body.filterData.ToDate && req.body.filterData.ToDate !== null && req.body.filterData.ToDate !== "") {
    if (req.body.filterData.FromDate === req.body.filterData.ToDate) {
      const frmdt = req.body.filterData.FromDate.replace(pattern, "$1-$2-$3");
      reportheader += ` - (${frmdt})`;
    } else {
      const frmdt = req.body.filterData.FromDate.replace(pattern, "$1-$2-$3");
      const todt = req.body.filterData.ToDate.replace(pattern, "$1-$2-$3");
      reportheader += ` - (${frmdt} to ${todt})`;
    }
  }
  
  let workbook1 = new excel.Workbook();
  workbook1 = commonfunction.excelexportinfo(workbook1, req);

  let sheet1 = workbook1.addWorksheet('Sheet1');
  
  sheet1.mergeCells('A1', 'P2');
  sheet1.getCell('A1').value = reportheader;
  
  sheet1.getRow(3).values = commonfunction.exceldeliveryheader();
  sheet1.columns = commonfunction.exceldeliveryids();
  sheet1.getRow(1).font = {name: 'Calibri', 'size': 14, bold: true };
  
  sheet1.getRow(3).font = {name: 'Calibri', 'size': 12, bold: true };
  sheet1.getColumn(1).alignment = { vertical: 'justify' };
  sheet1.getColumn(2).alignment = { vertical: 'justify' };
  sheet1.getColumn(3).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(4).alignment = { vertical: 'justify' };
  sheet1.getColumn(5).alignment = { vertical: 'justify' };
  sheet1.getColumn(6).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(7).alignment = { vertical: 'justify' };
  sheet1.getColumn(8).alignment = { vertical: 'justify' };
  sheet1.getColumn(9).alignment = { vertical: 'justify', horizontal: 'left' };
  sheet1.getColumn(10).alignment = { vertical: 'justify' };
  sheet1.getColumn(11).alignment = { vertical: 'justify' };
  sheet1.getColumn(12).alignment = { vertical: 'justify' };
  sheet1.getColumn(13).alignment = { vertical: 'justify', horizontal: 'center' };
  sheet1.getColumn(14).alignment = { vertical: 'justify' };
  sheet1.getColumn(15).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(16).alignment = { vertical: 'justify', horizontal: 'right' };
  sheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(9).numFmt = 'dd/mm/yyyy';
  sheet1.getColumn(16).numFmt = '0.000';
  sheet1.getCell('A1').alignment = { vertical: 'justify', horizontal: 'center' };
  
  let filename = `Deliveryreport_${Date.now()}.xlsx`;
  if (req.body.filterData.deliverytype === "RETURN") {
    filename = `Returndeliveryreport_${Date.now()}.xlsx`;
  }
  const responsepath = `Uploads/export_files/${filename}`;
  const filePath = `./public/${responsepath}`;
  
  Deliverystatement(req, res, (errs, orders) => {
    if (errs) {
      res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
      return;
    } else if (orders && orders !== null  && orders.length>0) {
      writeDeliverydata(orders, (err, orderData) => {
          sheet1.addRows(orderData);
          workbook1.xlsx.writeFile(filePath).then(function(erdata) {
            return res.send({success: true, data: responsepath});
          });
      });
    } else {
      return res.send({ success: false, message: "No data available" });
    }
  });  
});

module.exports = router;