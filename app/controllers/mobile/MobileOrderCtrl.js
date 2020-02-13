const errorhelper = require("../../../app/helpers/errorhelper");
const async = require("async");
const express = require("express");

const router = express.Router();
const _ = require("underscore");
const OrderModel = require("../../../app/models/OrderModel");
const BillModel = require("../../../app/models/BillModel");
const DeliveryModel = require("../../../app/models/DeliveryModel");
//const OrderreturnModel = require("../../../app/models/OrderreturnModel");
const SpecialPriceModel = require("../../../app/models/SpecialPriceModel");

router.get("/view/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, is_deleted: false, is_active: true};
    let select = "order_no order_date customer_name customer_mobile_no billing_address_line billing_area billing_city ";
    select += "billing_pincode billing_state order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no dyeing_dc_date ";
    select += "order_status received_weight inwards";

    let inwardselect = "inward_data._id inward_data.fabric_type inward_data.fabric_color inward_data.dia inward_data.rolls ";
    inwardselect += "inward_data.weight inward_data.process inward_data.process.process_name total_weight";

    const query = OrderModel.findOne(condition, select).populate("inwards", inwardselect);

    query.exec((err, orders) => {
      if (err) {
        return res.status(499).send({message: errorhelper.getErrorMessage(err)});
      }
      if (orders && orders !== null && orders._id) {
        const ord = {};
        ord.order_id = orders._id;
        ord.order_no = orders.order_no;
        ord.customer_name = orders.customer_name;
        ord.address = orders.billing_address_line;
        ord.address += (orders.billing_area && orders.billing_area !== null && orders.billing_area !== "") ? `, ${orders.billing_area}` : "";
        ord.address += (orders.billing_city && orders.billing_city !== null && orders.billing_city !== "") ? `, ${orders.billing_city}` : "";
        ord.address += (orders.billing_state && orders.billing_state !== null && orders.billing_state !== "") ? `, ${orders.billing_state}` : "";
        ord.address += (orders.billing_pincode && orders.billing_pincode !== null &&
            orders.billing_pincode !== "") ? ` - ${orders.billing_pincode}` : "";

        ord.customer_mobile_no = orders.customer_mobile_no;
        ord.order_date = orders.order_date;
        ord.order_reference_no = orders.order_reference_no;
        ord.customer_dc_no = orders.customer_dc_no;
        ord.customer_dc_date = orders.customer_dc_date;
        ord.dyeing_dc_no = orders.dyeing_dc_no;
        ord.dyeing_name = orders.dyeing.dyeing_name;
        ord.dyeing_dc_date = orders.dyeing_dc_date;
        ord.order_status = orders.order_status;
        ord.received_weight = orders.received_weight;
        ord.job_details = [];

        async.mapSeries(orders.inwards[0].inward_data, (inwards, calbk) => {
          if (inwards && inwards !== null && inwards._id) {
            const inw = {};
            inw.fabric = inwards.fabric_type;
            inw.color = inwards.fabric_color;
            inw.dia = inwards.dia;
            inw.rolls = inwards.rolls;
            inw.weight = inwards.weight;
            const process = _.flatten(_.pluck(inwards.process, "process_name"));
            inw.process = process.map((elem) => {
              return elem;
            }).join(", ");
            ord.job_details.push(inw);

            calbk(null);
          }
        }, (errd, results) => {
          return res.json(ord);
        });
      } else {
        return res.json(orders);
      }
    });
  }
});

router.get("/getOrders/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const initData = {};
    initData.Closed_Jobs = [];
    async.parallel([
      function (callback) { // Fetch measurement units
        const condition = {customer_id: req.params.id,
          is_deleted: false,
          is_active: true,
          $or: [{order_status: "New Order"},
            {order_status: "In Progress"}]};
        const select = "order_no order_date customer_name order_status inwards";

        const inwardselect = "inward_data.process";

        const query = OrderModel.find(condition, select).populate("inwards", inwardselect).sort({order_date: "desc"});

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            const orderlist = [];
            async.mapSeries(orders, (ord, cbk) => {
              const obj = {};
              obj.order_id = ord._id;
              obj.order_no = ord.order_no;
              obj.customer_name = ord.customer_name;
              obj.order_status = ord.order_status;
              obj.order_date = ord.order_date;


              if (ord && ord !== null && ord.inwards && ord.inwards.length > 0) {
                const ords = _.flatten(_.pluck(ord.inwards[0].inward_data, "process"));
                let process_name = _(ords).pluck("process_name");
                process_name = _(process_name).uniq();
                obj.process_name = process_name.map((elem) => {
                  return elem;
                }).join(", ");
                orderlist.push(obj);
                cbk(null, ord);
              } else {
                cbk(null, ord);
              }
            }, (errd, results) => {
              callback(null, orderlist);
            });
          }
        });
      },
      function (callback) { // Fetch special price for order
        const condition = {customer_id: req.params.id, is_deleted: false, is_active: true, order_status: "Completed"};
        const select = "order_no order_date customer_name order_status inwards";

        const inwardselect = "inward_data.process.process_name";

        const query = OrderModel.find(condition, select).populate("inwards", inwardselect).sort({order_date: "desc"});

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            async.mapSeries(orders, (ord, cbk) => {
              const obj = {};
              obj.order_id = ord._id;
              obj.order_no = ord.order_no;
              obj.customer_name = ord.customer_name;
              obj.order_status = ord.order_status;
              obj.order_date = ord.order_date;


              if (ord && ord !== null && ord.inwards && ord.inwards.length > 0) {
                const ords = _.flatten(_.pluck(ord.inwards[0].inward_data, "process"));
                let process_name = _(ords).pluck("process_name");
                process_name = _(process_name).uniq();
                obj.process_name = process_name.map((elem) => {
                  return elem;
                }).join(", ");
                initData.Closed_Jobs.push(obj);
                cbk(null, ord);
              } else {
                cbk(null, ord);
              }
            }, (errd, results) => {
              callback(null, initData.Closed_Jobs);
            });
          }
        });
      },
      function (callback) { // Fetch special price for order
        const condition = {customer_id: req.params.id, is_deleted: false, is_active: true, order_status: "Invoice and Delivery"};
        const select = "order_no order_date customer_name order_status inwards";

        const inwardselect = "inward_data.process.process_name";

        const query = OrderModel.find(condition, select).populate("inwards", inwardselect).sort({order_date: "desc"});

        query.exec((err, orders) => {
          if (err) {
            callback(err);
          } else {
            async.mapSeries(orders, (ord, cbk) => {
              const obj = {};
              obj.order_id = ord._id;
              obj.order_no = ord.order_no;
              obj.customer_name = ord.customer_name;
              obj.order_status = ord.order_status;
              obj.order_date = ord.order_date;


              if (ord && ord !== null && ord.inwards && ord.inwards.length > 0) {
                const ords = _.flatten(_.pluck(ord.inwards[0].inward_data, "process"));
                let process_name = _(ords).pluck("process_name");
                process_name = _(process_name).uniq();
                obj.process_name = process_name.map((elem) => {
                  return elem;
                }).join(", ");
                const qry = BillModel.findOne({"items.order_id": ord._id}, "invoice_no invoice_date");

                qry.exec((errs, invoice) => {
                  if (invoice && invoice !== null && invoice._id) {
                    obj.invoice_id = invoice._id;
                    obj.invoice_no = invoice.invoice_no;
                    obj.invoice_date = invoice.invoice_date;

                    initData.Closed_Jobs.push(obj);
                    cbk(null, ord);
                  } else {
                    cbk(null, ord);
                  }
                });
              } else {
                cbk(null, ord);
              }
            }, (errd, results) => {
              callback(null, initData.Closed_Jobs);
            });
          }
        });
      },
    ], (err, results) => { // Compute all results
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      initData.Open_Jobs = results[0] || [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/getSpecialprice/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, is_deleted: false, is_active: true};
    const select = "customer_name billing_address_line billing_area billing_city billing_pincode billing_state inwards";
    const inwardselect = "inward_data.process.process_name inward_data.process.process_id inward_data.measurement";

    const query = OrderModel.findOne(condition, select).populate('inwards', inwardselect);

    const query2 = SpecialPriceModel.find({order_id: req.params.id}, "order_id process_id measurement_id price");

    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }

      if (orders && orders !== null && orders._id) {
        const ord = {};
        ord.customer_name = orders.customer_name;
        ord.address = orders.billing_address_line;
        ord.address += (orders.billing_area && orders.billing_area !== null && orders.billing_area !== "") ? `, ${orders.billing_area}` : "";
        ord.address += (orders.billing_city && orders.billing_city !== null && orders.billing_city !== "") ? `, ${orders.billing_city}` : "";
        ord.address += (orders.billing_state && orders.billing_state !== null && orders.billing_state !== "") ? `, ${orders.billing_state}` : "";
        ord.address += (orders.billing_pincode && orders.billing_pincode !== null &&
            orders.billing_pincode !== "") ? ` - ${orders.billing_pincode}` : "";

        const ords = _.flatten(_.pluck(orders.inwards[0].inward_data, "process"));
        const ordsmeasure = _.flatten(_.pluck(orders.inwards[0].inward_data, "measurement"));
        const measurement_name = _(ordsmeasure).pluck("fabric_measure");
        const process_name = _(ords).pluck("process_name");

        let measurement_id = _(ordsmeasure).pluck("_id");
        let process_id = _(ords).pluck("process_id");

        ord.process_header = _(process_name).uniq();
        process_id = _(process_id).uniq();
        ord.measurement_header = _(measurement_name).uniq();
        measurement_id = _(measurement_id).uniq();

        query2.exec((errs, sprice) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
            return;
          }
          ord.pricedetails = [];
          let i = 0;
          if (sprice && sprice !== null && sprice.length > 0) {
            async.mapSeries(process_id, (processID, callback) => {
              ord.pricedetails[i] = [];
              async.each(measurement_id, (measurementID, cb) => {
                let processprice = "0.00";
                async.each(sprice, (pricedata, cbk) => {
                  if (pricedata.process_id && pricedata.measurement_id && String(pricedata.process_id) === String(processID) &&
                                                    String(pricedata.measurement_id) === String(measurementID)) {
                    processprice = parseFloat(pricedata.price).toFixed(2);
                  }
                  cbk();
                }, (errsdt) => {
                  ord.pricedetails[i].push(processprice);
                  cb(null);
                });
              }, (errdt) => {
                i += 1;
                callback(null);
              });
            }, (errd) => {
              if (errd) {
                res.send([]);
              }
              res.send(ord);
            });
          } else {
            async.mapSeries(process_id, (processID, callback) => {
              ord.pricedetails[i] = [];
              async.each(measurement_id, (measurementID, cb) => {
                ord.pricedetails[i].push("0.00");
                cb();
              }, (errs) => {
                i += 1;
                callback(null);
              });
            }, (errd) => {
              res.send(ord);
            });
          }
        });
      } else {
        res.send(orders);
      }
    });
  }
});

router.get("/viewLabreport/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, is_deleted: false, is_active: true};
    const select = "customer_name billing_address_line billing_area billing_city billing_pincode billing_state labReport labReportsummary";
    const query = OrderModel.findOne(condition, select);

    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        if (orders && orders !== null && orders._id) {
          const ord = {};
          if (orders.labReport && orders.labReport !== null && orders.labReport.length > 0) {
            ord.labReport = _.filter(orders.labReport, (value) => {
              return value.is_deleted !== true;
            });
          } else {
            ord.labReport = [];
          }

          if (orders.labReportsummary && orders.labReportsummary !== null && orders.labReportsummary.length > 0) {
            ord.labReportsummary = _.filter(orders.labReportsummary, (value) => {
              return value.is_deleted !== true;
            });
          } else {
            ord.labReportsummary = [];
          }

          ord.customer_name = orders.customer_name;
          ord.address = orders.billing_address_line;
          ord.address += (orders.billing_area && orders.billing_area !== null && orders.billing_area !== "") ? `, ${orders.billing_area}` : "";
          ord.address += (orders.billing_city && orders.billing_city !== null && orders.billing_city !== "") ? `, ${orders.billing_city}` : "";
          ord.address += (orders.billing_state && orders.billing_state !== null && orders.billing_state !== "") ? `, ${orders.billing_state}` : "";
          ord.address += (orders.billing_pincode && orders.billing_pincode !== null &&
            orders.billing_pincode !== "") ? ` - ${orders.billing_pincode}` : "";

          return res.send(ord);
        }
        return res.send(orders);
      }
    });
  }
});

router.get("/getDeliverydata/:id", (req, res) => {
  if (req.params.id && req.params.id !== null && req.params.id !== "") {
    const condition = {_id: req.params.id, is_deleted: false, is_active: true};
    const select = "customer_name billing_address_line billing_area billing_city billing_pincode billing_state outward_delivery return_delivery";
    const outwardselect = "delivery_no is_return";
    const outwardreturnselect = "delivery_no is_return";
    const query = OrderModel.findOne(condition, select).populate("outward_delivery", outwardselect).populate("return_delivery", outwardreturnselect);

    query.exec((err, orders) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      }
      if (orders && orders !== null && orders._id) {
        const ord = {};
        ord.Delivery_Menu = [];

        if (orders.outward_delivery && orders.outward_delivery !== null && orders.outward_delivery.length > 0) {
          _.each(orders.outward_delivery, (delivery) => {
            const delobj = {};
            delobj.id = delivery._id;
            delobj.delivery_no = delivery.delivery_no;
            delobj.type = "ORDERDELIVERY";
            ord.Delivery_Menu.push(delobj);
          });
        }

        if (orders.return_delivery && orders.return_delivery !== null && orders.return_delivery.length > 0) {
          _.each(orders.return_delivery, (delivery) => {
            const retobj = {};
            retobj.id = delivery._id;
            retobj.delivery_no = delivery.delivery_no;
            retobj.type = "ORDERRETURN";
            ord.Delivery_Menu.push(retobj);
          });
        }

        ord.customer_name = orders.customer_name;
        ord.address = orders.billing_address_line;
        ord.address += (orders.billing_area && orders.billing_area !== null && orders.billing_area !== "") ? `, ${orders.billing_area}` : "";
        ord.address += (orders.billing_city && orders.billing_city !== null && orders.billing_city !== "") ? `, ${orders.billing_city}` : "";
        ord.address += (orders.billing_state && orders.billing_state !== null && orders.billing_state !== "") ? `, ${orders.billing_state}` : "";
        ord.address += (orders.billing_pincode && orders.billing_pincode !== null &&
            orders.billing_pincode !== "") ? ` - ${orders.billing_pincode}` : "";

        return res.send(ord);
      }
      return res.send(orders);
    });
  }
});

router.get("/viewDelivery/:type/:id", (req, res) => {
  if (req.params.type && req.params.type !== null && req.params.type !== "" && (req.params.type === "ORDERDELIVERY" || req.params.type === "ORDERRETURN") &&
            req.params.id && req.params.id !== null && req.params.id !== "") {
    if (req.params.type === "ORDERDELIVERY") {
      const condition = {_id: req.params.id, is_deleted: false, is_active: true, is_return: false};
      const ordselect = "order_no order_date order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no dyeing_dc_date";

      let outwardselect = "order_id delivery_no delivery_date outward_data.fabric_type outward_data.fabric_color outward_data.dia ";
      outwardselect += "outward_data.delivery_roll outward_data.delivery_weight outward_data.process is_return";
      const query = DeliveryModel.findOne(condition, outwardselect).populate("order_id", ordselect);

      query.exec((err, orders) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }
        if (orders && orders !== null && orders.outward_data && orders.outward_data !== null && orders.outward_data.length > 0 &&
                            orders._id && orders.order_id && orders.order_id !== null && orders.order_id._id) {
          const ord = {};
          ord.order_id = orders.order_id._id;
          ord.order_no = orders.order_id.order_no;
          ord.order_date = orders.order_id.order_date;
          ord.order_reference_no = orders.order_id.order_reference_no;
          ord.customer_dc_no = orders.order_id.customer_dc_no;
          ord.customer_dc_date = orders.order_id.customer_dc_date;
          ord.dyeing_dc_no = orders.order_id.dyeing_dc_no;
          ord.dyeing_name = orders.order_id.dyeing.dyeing_name;
          ord.dyeing_dc_date = orders.order_id.dyeing_dc_date;
          ord.delivery_no = orders.delivery_no;
          ord.delivery_date = orders.delivery_date;
          ord.delivery_details = [];

          async.mapSeries(orders.outward_data, (outward, cbk) => {
            const obj = {};
            obj.fabric_type = outward.fabric_type;
            obj.fabric_color = outward.fabric_color;
            obj.dia = outward.dia;
            obj.delivery_roll = outward.delivery_roll;
            obj.delivery_weight = outward.delivery_weight;

            if (outward.process && outward.process.length > 0) {
              let process_name = _(outward.process).pluck("process_name");
              process_name = _(process_name).uniq();
              obj.process_name = process_name.map((elem) => {
                return elem;
              }).join(", ");
              ord.delivery_details.push(obj);
              cbk(null, ord);
            } else {
              cbk(null, ord);
            }
          }, (errd, results) => {
            return res.send(ord);
          });
        } else {
          return res.send([]);
        }
      });
    } else {
      const condition = {_id: req.params.id, is_deleted: false, is_active: true, is_return: true};
      const ordselect = "order_no order_date order_reference_no customer_dc_no customer_dc_date dyeing dyeing_dc_no dyeing_dc_date";

      let outwardselect = "order_id delivery_no delivery_date outward_data.fabric_type outward_data.fabric_color outward_data.dia ";
      outwardselect += "outward_data.delivery_roll outward_data.delivery_weight outward_data.process is_return";
      const query = DeliveryModel.findOne(condition, outwardselect).populate("order_id", ordselect);

      query.exec((err, orders) => {
        if (err) {
          res.status(499).send({message: errorhelper.getErrorMessage(err)});
          return;
        }
        if (orders && orders !== null && orders.outward_data && orders.outward_data !== null && orders.outward_data.length > 0 &&
                            orders._id && orders.order_id && orders.order_id !== null && orders.order_id._id) {
          const ord = {};
          ord.order_id = orders.order_id._id;
          ord.order_no = orders.order_id.order_no;
          ord.order_date = orders.order_id.order_date;
          ord.order_reference_no = orders.order_id.order_reference_no;
          ord.customer_dc_no = orders.order_id.customer_dc_no;
          ord.customer_dc_date = orders.order_id.customer_dc_date;
          ord.dyeing_dc_no = orders.order_id.dyeing_dc_no;
          ord.dyeing_name = orders.order_id.dyeing.dyeing_name;
          ord.dyeing_dc_date = orders.order_id.dyeing_dc_date;
          ord.delivery_no = orders.delivery_no;
          ord.delivery_date = orders.delivery_date;
          ord.delivery_details = [];

          async.mapSeries(orders.outward_data, (outward, cbk) => {
            const obj = {};
            obj.fabric_type = outward.fabric_type;
            obj.fabric_color = outward.fabric_color;
            obj.dia = outward.dia;
            obj.delivery_roll = outward.delivery_roll;
            obj.delivery_weight = outward.delivery_weight;

            if (outward.process && outward.process.length > 0) {
              let process_name = _(outward.process).pluck("process_name");
              process_name = _(process_name).uniq();
              obj.process_name = process_name.map((elem) => {
                return elem;
              }).join(", ");
              ord.delivery_details.push(obj);
              cbk(null, ord);
            } else {
              cbk(null, ord);
            }
          }, (errd, results) => {
            return res.send(ord);
          });
        } else {
          return res.send({});
        }
      });
    }
  }
});

module.exports = router;
