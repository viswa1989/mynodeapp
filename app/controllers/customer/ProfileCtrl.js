const commonfunction = require("../../../app/middlewares/commonfunction");
const errorhelper = require("../../../app/helpers/errorhelper");
const customerpagelog = require("../../../app/middlewares/customerpagelog");
const notificationlog = require("../../../app/middlewares/notificationlog");
const mongoose = require("mongoose");
const async = require("async");
const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();
const CustomerModel = require("../../../app/models/CustomersModel");
const CustomergroupsModel = require("../../../app/models/CustomergroupsModel");
const AccounttransModel = require("../../../app/models/AccounttransactionModel");
const BillModel = require("../../../app/models/BillModel");
const ProcessModel = require("../../../app/models/ProcessModel");
const DivisionModel = require("../../../app/models/DivisionsModel");
const FabMeasureModel = require("../../../app/models/FabMeasureModel");
const OrderModel = require("../../../app/models/OrderModel");
const DeliveryModel = require("../../../app/models/DeliveryModel");
// var DeliveryreturnModel = require("app/models/OrderreturnModel");

router.get("/me", (req, res) => {
  CustomerModel.findOne({_id: req.session.id}, "normalized_name email_id name", (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    return res.send({success: true, message: data});
  });
});

// view customer
router.get("/viewhistory", (req, res) => {
  req.filter = commonfunction.getCustomergraphdate();
  async.parallel([
    function (callback) { // Fetch branch account details by branch id
      let select = "name gstin gstTreatment placeofSupply email_id mobile_no alternate_no contact_person ";
      select += "contactperson_mobile_no followup_person address group is_favourite";

      const query = CustomerModel.findOne({_id: req.session.id}, select).populate("placeofSupply", "name");
      query.exec((err, Customers) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Customers);
        }
      });
    },
    function (callback) { // Fetch bills for the customer
      const select = "division_id invoice_date invoice_no type payment_status total paid items";

      const query = BillModel.find({customer_id: req.session.id}, select).populate("division_id", "_id name").sort({invoice_date: "desc"});
      query.exec((err, Bills) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Bills);
        }
      });
    },
    function (callback) { // Fetch transactions by the customer
      const select = "bills type category_name transaction_type transaction_date transaction_amount division_id ledger_id memo";

      const query = AccounttransModel.find({payee_id: req.session.id}, select).populate("division_id", "_id name")
        .populate("ledger_id", "_id name").sort({transaction_date: "desc"});
      query.exec((err, Trans) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Trans);
        }
      });
    },
    function (callback) { // Fetch Customer Groups
      CustomerModel.findOne({_id: req.session.id}, "group").exec((err, Customers) => {
        if (err) {
          callback(err);
        } else if (Customers && Customers.group) {
          const query = CustomergroupsModel.findOne({_id: Customers.group}, "name group_discount");
          query.exec((errs, Group) => {
            if (errs) {
              callback(errs);
            } else {
              callback(null, Group);
            }
          });
        } else {
          callback(null, {});
        }
      });
    },
    function (callback) { // Fetch division details
      const query = DivisionModel.find({is_deleted: false}, "name");
      query.exec((err, divisons) => {
        if (err) {
          callback(err);
        } else {
          callback(null, divisons);
        }
      });
    },
    function (callback) { // Fetch fabric measurement details
      const query = FabMeasureModel.find({is_deleted: false}, "fabric_measure");
      query.exec((err, measurements) => {
        if (err) {
          callback(err);
        } else {
          callback(null, measurements);
        }
      });
    },
    function (callback) { // Fetch all process details
      const condition = {is_deleted: false, is_active: true};
      const query = ProcessModel.find(condition, "_id process_name division_id measurement");
      query.exec((err, Processdetail) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Processdetail);
        }
      });
    },
    function (callback) { // Fetch delivery details
      const condition = {customer_id: req.session.id, is_deleted: false, is_active: true, is_return: false};
      const select = "order_id order_no customer_name customer_mobile_no order_status order_date delivery_no delivery_date outward_data is_return";
      const query = DeliveryModel.find(condition, select).sort({delivery_date: "desc"});
      query.exec((err, delivery) => {
        if (err) {
          callback(err);
        } else {
          callback(null, delivery);
        }
      });
    },
    function (callback) { // Fetch delivery return details
      const cnd = {customer_id: req.session.id, is_deleted: false, is_active: true, is_return: true};
      const field = "order_id order_no customer_name customer_mobile_no order_date delivery_no delivery_date outward_data is_return";
      const query = DeliveryModel.find(cnd, field).sort({delivery_date: "desc"});
      query.exec((err, deliveryreturn) => {
        if (err) {
          callback(err);
        } else {
          callback(null, deliveryreturn);
        }
      });
    },
    function (callback) {
      if (req.filter.startDate) {
        const id = mongoose.Types.ObjectId(req.session.id);
        const match = {$match: {customer_id: id, is_deleted: false, invoice_date: { $gte: req.filter.startDate, $lte: req.filter.endDate } }};
        const group = {$group: {_id: { month: { $month: "$invoice_date" }}, count: {$sum: 1}}};
        const project = {$project: {count: 1, month: "$_id.month"}};
        BillModel.aggregate(match, group, project, (err, bills) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, bills);
          }
        });
      } else {
        callback(null, []);
      }
    },
    function (callback) {
      if (req.filter.startDate) {
        const id = mongoose.Types.ObjectId(req.session.id);
        const match = {$match: {customer_id: id, is_deleted: false, order_date: { $gte: req.filter.startDate, $lte: req.filter.endDate } }};
        const group = {$group: {_id: { month: { $month: "$order_date" }}, count: {$sum: 1}}};
        const project = {$project: {count: 1, month: "$_id.month"}};
        OrderModel.aggregate(match, group, project, (err, ords) => {
          if (err) {
            callback(err); // TODO handle error
          } else {
            callback(null, ords);
          }
        });
      } else {
        callback(null, []);
      }
    },
  ], (err, results) => { // Compute all results
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }

    if (results === null || results[0] === null) {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }

    const filterData = {};
    filterData.Customerdetails = results[0] || [];
    filterData.Billdetails = results[1] || [];
    filterData.Transactiondetails = results[2] || [];
    filterData.Customergroupdetails = results[3] || [];
    filterData.Divisions = results[4] || [];
    filterData.Measurements = results[5] || {};
    filterData.Processdetail = results[6] || {};
    filterData.Delivery = results[7] || [];
    filterData.Deliveryreturn = results[8] || [];
    filterData.transaction = results[9] || [];
    filterData.orders = results[10] || [];
    filterData.filterdates = req.filter.month_from;

    return res.send({success: true, data: filterData});
  });
});

router.post("/update", (req, res) => {
  CustomerModel.findOne({_id: req.body.customerForm._id}, (err, user) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (user && user !== null && user._id) {
      // schema before save actions
      user = commonfunction.beforeSave(user, req);
      user.name = req.body.customerForm.name;
      user.normalized_name = req.body.customerForm.name;
      user.gstTreatment = req.body.customerForm.gstTreatment;
      user.placeofSupply = req.body.customerForm.state;
      user.gstin = req.body.customerForm.gstin;
      user.email_id = req.body.customerForm.email_id;
      user.mobile_no = req.body.customerForm.mobile_no;
      user.alternate_no = req.body.customerForm.alternate_no;
      user.password = req.body.customerForm.password;
      if (req.body.customerForm.password && req.body.customerForm.password !== null && req.body.customerForm.password !== "") {
        user.hash_password = bcrypt.hashSync(req.body.customerForm.password, 10);
      } else {
        user.hash_password = null;
      }
      user.contact_person = req.body.customerForm.contact_person;
      user.contactperson_mobile_no = req.body.customerForm.contactperson_mobile_no;
      user.followup_person = req.body.customerForm.followup_person;
      user.address = req.body.customerForm.address;
      user.status_inward = req.body.customerForm.status_inward;
      user.status_outward = req.body.customerForm.status_outward;
      if (req.body.customerForm.group && req.body.customerForm.group !== "") {
        user.group = req.body.customerForm.group;
      }

      user.save((errs, users) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        } else if (users && users !== null && users._id) {
          const obj = {};
          obj.data = users;
          obj.PAGE = "CUSTOMER";
          const logdata = customerpagelog.update(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          res.send({success: true, message: `${users.name} profile successfully updated!`});
        } else {
          return res.send({success: false, message: "Something went wrong please try again later!."});
        }
      });
    } else {
      return res.send({success: false, message: "Customer details not found"});
    }
  });
});

router.post("/savegstDetails", (req, res) => {
  CustomerModel.findOne({_id: req.body._id}, (err, user) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
    } else if (user && user !== null && user._id) {
      // schema before save actions
      user = commonfunction.beforeSave(user, req);
      user.gstTreatment = req.body.gstTreatment;
      user.placeofSupply = req.body.placeofSupply;
      user.gstin = req.body.gstin;

      user.save((errs, users) => {
        if (errs) {
          res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          return;
        } else if (users && users !== null && users._id) {
          const obj = {};
          obj.data = users;
          obj.PAGE = "CUSTOMER";
          const logdata = customerpagelog.updategst(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }

          return res.send({success: true, message: "GST Treatment details for this customer updated successfully"});
        }
        return res.send({success: false, message: "Something went wrong please try again later!."});
      });
    } else {
      return res.send({success: false, message: "Customer details not found"});
    }
  });
});

router.post("/updateGroup", (req, res) => {
  if (req.body.group && req.body.group !== null && req.body.group !== "") {
    CustomerModel.findOne({_id: req.body.customerID}, (err, user) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (user && user !== null && user._id) {
        // schema before save actions
        user = commonfunction.beforeSave(user, req);
        user.group = req.body.group;

        user.save((errs, users) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
          } else if (users && users !== null && users._id) {
            const obj = {};
            obj.data = users;
            obj.PAGE = "CUSTOMER";
            const logdata = customerpagelog.updategroup(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({success: true, message: `${users.name} discount group successfully updated!`});
          } else {
            return res.send({success: false, message: "Something went wrong please try again later!."});
          }
        });
      } else {
        return res.send({success: false, message: "Customer details not found"});
      }
    });
  } else {
    res.send({success: false, message: "Please select the customer discount group"});
  }
});

router.get("/getCustomer/:id/:division_id", (req, res) => {
  const re = new RegExp(req.params.id, "i");
  const sel = "name mobile_no address gstin gstTreatment placeofSupply group";
  const query = CustomerModel.find({name: {$regex: re}}, sel).sort({created: -1}).limit(8);
  query.exec((err, cus) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({success: true, data: cus});
  });
});

router.post("/setFavourite", (req, res) => {
  if (req.body._id && req.body.is_favourite !== null) {
    CustomerModel.findOne({_id: req.body._id}, (err, user) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else if (user && user !== null && user._id) {
        // schema before save actions
        user = commonfunction.beforeSave(user, req);
        user.is_favourite = req.body.is_favourite;

        user.save((errs, users) => {
          if (errs) {
            res.status(499).send({message: errorhelper.getErrorMessage(errs)});
            return;
          } else if (users && users !== null && users._id) {
            res.send({success: true, message: `Customer ${users.name} added to favourites!`});
            return;
          }
          return res.send({success: false, message: "Something went wrong please try again later!."});
        });
      } else {
        return res.send({success: false, message: "Customer details not found"});
      }
    });
  }
});

// Fetch customer and order details
router.post("/getcustomerDetails", (req, res) => {
  if (req.body.customer_mobile && req.body.customer_mobile !== "") {
    async.parallel([
      function (callback) { // Fetch customer details by mobile number
        const re = new RegExp(req.body.customer_mobile, "i");

        let select = "name email_id mobile_no alternate_no branches address group contact_person contactperson_mobile_no ";
        select += "followup_person is_favourite status_inward status_outward";
        const query = CustomerModel.find({$or: [{name: {$regex: re}},
          {$where: `function() { return this.mobile_no.toString().match(/${req.body.customer_mobile}/) !== null; }`}],
        is_deleted: false,
        is_active: true}, select);
        query.exec((err, Customer) => {
          if (err) {
            callback(err);
          } else {
            callback(null, Customer);
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
      initData.Customer = results[0] || [];
      initData.Orders = [];

      return res.send({success: true, data: initData});
    });
  }
});

router.get("/viewinvoice/:id", (req, res) => {
  BillModel.findOne({_id: req.params.id, customer_id: req.session.id}).exec((err, Inv) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send(Inv);
  });
});

module.exports = router;
