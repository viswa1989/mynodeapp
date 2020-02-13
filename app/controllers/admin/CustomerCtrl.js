const auth = require("../../../app/middlewares/auth");
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
const CustomeropeningbalModel = require("../../../app/models/CustomeropeningbalancesModel");
const CustomergroupsModel = require("../../../app/models/CustomergroupsModel");
const AccounttransModel = require("../../../app/models/AccounttransactionModel");
const BillModel = require("../../../app/models/BillModel");
const ProcessModel = require("../../../app/models/ProcessModel");
const StatelistModel = require("../../../app/models/StatelistModel");
const GsttreatmentModel = require("../../../app/models/GsttreatmentModel");
const DivisionModel = require("../../../app/models/DivisionsModel");
const FabMeasureModel = require("../../../app/models/FabMeasureModel");
const OrderModel = require("../../../app/models/OrderModel");
const DeliveryModel = require("../../../app/models/DeliveryModel");
// var DeliveryreturnModel = require("app/models/OrderreturnModel");

function userList(req, res) {
  const obj = {};

  if (req.body.filterData && req.body.filterData.favourites && req.body.filterData.favourites === true) {
    obj.is_favourite = req.body.filterData.favourites;
  }
  if (req.body.filterData && req.body.filterData.divisions && req.body.filterData.divisions !== "ALL" && req.body.filterData.divisions !== "") {
    obj.division_id = req.body.filterData.divisions;
  }
  if (req.body.filterData && req.body.filterData.groups && req.body.filterData.groups !== "ALL" && req.body.filterData.groups !== "") {
    obj.group = req.body.filterData.groups;
  }
  if (req.body.filterData && req.body.filterData.groups && req.body.filterData.startswith !== "ALL" && req.body.filterData.startswith !== "") {
    obj.name = new RegExp(`^${req.body.filterData.startswith}`, "i");
  }
  let skipdata = 0;
  let limitdata = 0;
  if (req.body.filterData.skip && req.body.filterData.skip !== null && parseInt(req.body.filterData.skip) > 0) {
    skipdata = req.body.filterData.skip;
  }
  if (req.body.filterData.limit && req.body.filterData.limit !== null && parseInt(req.body.filterData.limit) > 0) {
    limitdata = req.body.filterData.limit;
  }

  const select = "placeofSupply status_inward status_outward name normalized_name mobile_no is_favourite email_id";

  CustomerModel.find(obj, select).sort({normalized_name: "asc"}).skip(skipdata).limit(limitdata)
    .exec((err, data) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
      } else {
        res.json(data);
      }
    });
}

// Controller constructor
router.use((req, res, next) => {
  const arr = req.originalUrl.split("/");
  const skip = ["me", "list", "view"];
  if (skip.indexOf(arr[3]) !== -1) { // arr[3] is action ex:list
    next();
  } else {
    req.caction = `users ${arr[3]}`;
    auth.permission(req, res, next, () => {
      next();
    });
  }
});

router.post("/list", userList);

// Fetch all filter data
router.get("/getFilterdata", (req, res) => {
  async.parallel([
    function (callback) { // Fetch all branch details
      const conditions = {is_deleted: false, is_active: true};
      if (req.session.branch && req.session.branch !== null) {
        conditions._id = req.session.branch;
      }
      const query = DivisionModel.find(conditions, "_id name");
      query.exec((err, Branchdetail) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Branchdetail);
        }
      });
    },
    function (callback) { // Fetch customer group details
      const query = CustomergroupsModel.find({}, "_id name is_deleted is_active default");
      query.exec((err, Customergroup) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Customergroup);
        }
      });
    },
    function (callback) { // Fetch all branch details
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
    function (callback) { // Fetch State list
      const query = StatelistModel.find({}).sort({name: "asc"});
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
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    if (results === null || results[0] === null) {
      return res.send({success: false, message: "Something went wrong please try again later!."});
    }
    const filterData = {};
    filterData.Divisions = results[0] || [];
    filterData.Customergroup = results[1] || [];
    filterData.Processdetail = results[2] || [];
    filterData.Statelistdetails = results[3] || [];
    filterData.Gsttreatmentdetails = results[4] || [];
    filterData.Currentbranch = req.session.branch;

    return res.send({success: true, data: filterData});
  });
});

router.get("/me", (req, res) => {
  CustomerModel.findOne({_id: req.session.id}, (err, data) => {
    if (err) {
      res.status(499).send({message: errorhelper.getErrorMessage(err)});
      return;
    }
    res.send({name: data.name, username: data.username});
  });
});

// save the customer
router.post("/create", (req, res) => {
  if (req.session.branch && req.session.branch !== null) {
    if ((req.body.customerForm.password && !req.body.customerForm.confirm_password) || (!req.body.customerForm.password &&
        req.body.customerForm.confirm_password) || (req.body.customerForm.password && req.body.customerForm.confirm_password &&
            req.body.customerForm.password !== req.body.customerForm.confirm_password)) {
      return res.send({success: false, message: "Password and Retype Password field doesn't match"});
    }
    const division = [];
    division.push(req.session.branch);

    let newUser = new CustomerModel({
      name: req.body.customerForm.name,
      normalized_name: req.body.customerForm.name,
      gstTreatment: req.body.customerForm.gstTreatment,
      placeofSupply: req.body.customerForm.state,
      gstin: req.body.customerForm.gstin,
      email_id: req.body.customerForm.email_id,
      mobile_no: req.body.customerForm.mobile_no,
      alternate_no: req.body.customerForm.alternate_no,
      password: req.body.customerForm.password,
      contact_person: req.body.customerForm.contact_person,
      contactperson_mobile_no: req.body.customerForm.contactperson_mobile_no,
      followup_person: req.body.customerForm.followup_person,
      address: req.body.customerForm.address,
      status_inward: req.body.customerForm.status_inward,
      status_outward: req.body.customerForm.status_outward,
      division_id: division,
    });
    if (req.body.customerForm.password && req.body.customerForm.password !== null && req.body.customerForm.password !== "") {
      newUser.hash_password = bcrypt.hashSync(req.body.customerForm.password, 10);
    } else {
      newUser.hash_password = null;
    }
    // schema before save actions
    newUser = commonfunction.beforeSave(newUser, req);
    newUser.branches = [];
    if (req.body.customerForm.group && req.body.customerForm.group !== "") {
      newUser.group = req.body.customerForm.group;
    }

    newUser.save((err, users) => {
      if (err) {
        res.status(499).send({message: errorhelper.getErrorMessage(err)});
        return;
      } else if (users && users !== null && users._id) {
        if(req.body.customerForm.customer_previous_balance && req.body.customerForm.customer_previous_balance !== "" && 
                parseFloat(req.body.customerForm.customer_previous_balance)>0){
            
          let CustopeningbalModel= new CustomeropeningbalModel({
            name: users.name,
            customer_id: users._id,
            total_balance: req.body.customerForm.customer_previous_balance,
            total_allocated: 0,
            pending_balance: req.body.customerForm.customer_previous_balance
          });
          CustopeningbalModel = commonfunction.beforeSave(CustopeningbalModel, req);
          
          CustopeningbalModel.save((erd, cusbal) => {
            if (erd) {
              CustomerModel.findByIdAndRemove(users._id, (usererr) => {});
              res.status(499).send({message: errorhelper.getErrorMessage(erd)});
              return;
            } else if (cusbal && cusbal !== null && cusbal._id) {
              users.opening_balance = cusbal._id;
              users.save((ers, userDt) => {
                if (ers) {
                  CustomerModel.findByIdAndRemove(users._id, (usererr) => {});
                  res.status(499).send({message: errorhelper.getErrorMessage(ers)});
                  return;
                } else if (userDt && userDt !== null && userDt._id) {
                  const obj = {};
                  obj.data = userDt;
                  obj.PAGE = "CUSTOMER";
                  const logdata = customerpagelog.create(obj, req);
                  if (logdata.message && logdata.message !== null) {
                    notificationlog.savelog(logdata, res);
                  }

                  return res.send({success: true, message: `${userDt.name} profile successfully created!`});
                } else {
                  CustomerModel.findByIdAndRemove(users._id, (usererr) => {});
                  return res.send({success: false, message: "Something went wrong please try again later!."});
                }
              });
            } else {
              CustomerModel.findByIdAndRemove(users._id, (usererr) => {});
              return res.send({success: false, message: "Something went wrong please try again later!."});
            }
          });
        } else {
          const obj = {};
          obj.data = users;
          obj.PAGE = "CUSTOMER";
          const logdata = customerpagelog.create(obj, req);
          if (logdata.message && logdata.message !== null) {
            notificationlog.savelog(logdata, res);
          }
          return res.send({success: true, message: `${users.name} profile successfully created!`});
        }
      } else {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }
    });
  } else {
    return res.send({success: false, message: "New customers must be added by division users only."});
  }
});

// save customer partial
router.post("/partialcreate", (req, res) => {
  if (req.session.branch && req.session.branch !== null) {
    CustomergroupsModel.findOne({default: true}, (errs, data) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
      } else if (data && data !== null && data._id) {
        const division = [];
        division.push(req.session.branch);

        let newUser = new CustomerModel({
          name: req.body.customerForm.name,
          normalized_name: req.body.customerForm.name,
          gstTreatment: req.body.customerForm.gstTreatment,
          placeofSupply: req.body.customerForm.state,
          gstin: req.body.customerForm.gstin,
          mobile_no: req.body.customerForm.mobile_no,
          contact_person: req.body.customerForm.contact_person,
          contactperson_mobile_no: req.body.customerForm.contactperson_mobile_no,
          address: req.body.customerForm.address,
          status_inward: false,
          status_outward: false,
          division_id: division,
        });
        // schema before save actions
        newUser = commonfunction.beforeSave(newUser, req);
        newUser.branches = [];
        newUser.group = data._id;
        if (req.body.customerForm.address !== null && req.body.customerForm.address.length>0 && (!req.body.customerForm.address[0].company_name || 
                req.body.customerForm.address[0].company_name === "")) {
          newUser.address[0].company_name = req.body.customerForm.name;
        }

        newUser.save((err, users) => {
          if (err) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
            return;
          } else if (users && users !== null && users._id) {
            const obj = {};
            obj.data = users;
            obj.PAGE = "CUSTOMER";
            const logdata = customerpagelog.create(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            return res.send({success: true, data: users});
          }
          return res.send({success: false, message: "Something went wrong please try again later!."});
        });
      } else {
        res.send({success: false, message: "Default customer group not found"});
      }
    });
  } else {
    return res.send({success: false, message: "New customers must be added by division users only."});
  }
});

// view customer
router.get("/view/:id", (req, res) => {
  req.filter = commonfunction.getCustomergraphdate();
  async.parallel([
    function (callback) { // Fetch branch account details by branch id
      let select = "name gstin gstTreatment placeofSupply email_id mobile_no alternate_no contact_person contactperson_mobile_no ";
      select += "followup_person address group is_favourite status_inward status_outward opening_balance division_id";

      const query = CustomerModel.findOne({_id: req.params.id}, select).populate("opening_balance", "total_balance pending_balance due_status created");
      query.exec((err, Customers) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Customers);
        }
      });
    },
    function (callback) { // Fetch bills for the customer
      const select = "division_id invoice_date invoice_no type payment_status total paid items created";

      const query = BillModel.find({customer_id: req.params.id, is_deleted: false}, select).populate("division_id", "_id name").sort({invoice_date: "desc"});
      query.exec((err, Bills) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Bills);
        }
      });
    },
    function (callback) { // Fetch transactions by the customer
      let select = "bills type category_name transaction_type transaction_date previous_owe customer_openingbalance transaction_amount ";
      select += "division_id ledger_id memo created cheque_no";
              
      const query = AccounttransModel.find({payee_id: req.params.id, is_deleted: false}, select).populate("division_id", "_id name")
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
      const query = CustomergroupsModel.find({is_deleted: false}, "name default group_discount");
      query.exec((err, Group) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Group);
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
    function (callback) { // Fetch delivery details
      const condition = {customer_id: req.params.id, is_deleted: false, is_active: true, is_return: false};
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
      const cnd = {customer_id: req.params.id, is_deleted: false, is_active: true, is_return: true};
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
        const id = mongoose.Types.ObjectId(req.params.id);
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
        const id = mongoose.Types.ObjectId(req.params.id);
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
    filterData.Measurements = results[5] || [];
    filterData.Delivery = results[6] || [];
    filterData.Deliveryreturn = results[7] || [];
    filterData.transaction = results[8] || [];
    filterData.orders = results[9] || [];
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
      if (req.body.customerForm.state && req.body.customerForm.state !== null && req.body.customerForm.state !== "") {
        user.placeofSupply = req.body.customerForm.state;
      } else {
        user.placeofSupply = null;
      }
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
          if(req.body.customerForm.customer_previous_balance && req.body.customerForm.customer_previous_balance !== ""){
              
            if (users.opening_balance && users.opening_balance !== "") {
              CustomeropeningbalModel.findOne({_id: users.opening_balance}, (cer, copen) => {
                if (cer) {
                  res.status(499).send({message: errorhelper.getErrorMessage(erd)});
                  return;
                } else if (copen && copen !== null && copen._id) {
                  if(copen.due_status !== "Closed" || parseFloat(copen.total_balance) !==  parseFloat(req.body.customerForm.customer_previous_balance)){
                    copen.total_balance = parseFloat(req.body.customerForm.customer_previous_balance);
                  }
                  copen = commonfunction.beforeSave(copen, req);
                  copen.save((erd, cusbal) => {
                    if (erd) {
                      res.status(499).send({message: errorhelper.getErrorMessage(erd)});
                      return;
                    } else if (cusbal && cusbal !== null && cusbal._id) {
                      const obj = {};
                      obj.data = users;
                      obj.PAGE = "CUSTOMER";
                      const logdata = customerpagelog.update(obj, req);
                      if (logdata.message && logdata.message !== null) {
                        notificationlog.savelog(logdata, res);
                      }
                      return res.send({success: true, message: `${users.name} profile successfully updated!`});
                    } else {
                      return res.send({success: false, message: "Something went wrong please try again later!."});
                    }
                  });
                } else {
                  return res.send({success: false, message: "Something went wrong please try again later!."});
                }
              });
            } else {
              let CustopeningbalModel= new CustomeropeningbalModel({
                name: users.name,
                customer_id: users._id,
                total_balance: req.body.customerForm.customer_previous_balance,
                total_allocated: 0,
                pending_balance: req.body.customerForm.customer_previous_balance
              });
              CustopeningbalModel = commonfunction.beforeSave(CustopeningbalModel, req);

              CustopeningbalModel.save((erd, cusbal) => {
                if (erd) {
                  res.status(499).send({message: errorhelper.getErrorMessage(erd)});
                  return;
                } else if (cusbal && cusbal !== null && cusbal._id) {
                  users.opening_balance = cusbal._id;
                  users.save((ers, userDt) => {
                    if (ers) {
                      res.status(499).send({message: errorhelper.getErrorMessage(ers)});
                      return;
                    } else if (userDt && userDt !== null && userDt._id) {
                      const obj = {};
                      obj.data = users;
                      obj.PAGE = "CUSTOMER";
                      const logdata = customerpagelog.update(obj, req);
                      if (logdata.message && logdata.message !== null) {
                        notificationlog.savelog(logdata, res);
                      }
                      return res.send({success: true, message: `${users.name} profile successfully updated!`});
                    } else {
                      return res.send({success: false, message: "Something went wrong please try again later!."});
                    }
                  });
                } else {
                  return res.send({success: false, message: "Something went wrong please try again later!."});
                }
              });
            }
          } else {
            const obj = {};
            obj.data = users;
            obj.PAGE = "CUSTOMER";
            const logdata = customerpagelog.update(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }

            return res.send({success: true, message: `${users.name} profile successfully updated!`});
          }
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
            return;
          } else if (users && users !== null && users._id) {
            const obj = {};
            obj.data = users;
            obj.PAGE = "CUSTOMER";
            const logdata = customerpagelog.updategroup(obj, req);
            if (logdata.message && logdata.message !== null) {
              notificationlog.savelog(logdata, res);
            }
            return res.send({success: true, message: `${users.name} discount group successfully updated!`});
          }
          return res.send({success: false, message: "Something went wrong please try again later!."});
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
  const regex = new RegExp(req.params.id, "i");
  const query = CustomerModel.find({name: regex}, "name mobile_no address gstin gstTreatment placeofSupply group").sort({created: -1}).limit(8);
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

        let select = "name email_id mobile_no alternate_no division_id address group contact_person gstin ";
        select += "contactperson_mobile_no followup_person is_favourite status_inward status_outward";
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

// Fetch customer and order details
router.post("/getcustomerbyDivision", (req, res) => {
  if (req.body.customer_mobile && req.body.customer_mobile !== "") {
    async.parallel([
      function (callback) { // Fetch customer details by mobile number
        const re = new RegExp(req.body.customer_mobile, "i");

        let select = "name email_id mobile_no alternate_no division_id address group contact_person contactperson_mobile_no ";
        select += "followup_person is_favourite status_inward status_outward gstin";
        const query = CustomerModel.find({division_id: req.session.branch,
          $or: [{name: {$regex: re}}, {$where: `function() { return this.mobile_no.toString().match(/${req.body.customer_mobile}/) !== null; }`}],
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

// view customer transactions
router.get("/getcustomerTransactions/:id", (req, res) => {
  async.parallel([
    function (callback) { // Fetch bills for the customer
      const select = "division_id invoice_date invoice_no type payment_status total paid";

      const query = BillModel.find({customer_id: req.params.id, is_deleted: false, payment_status: {$ne: "COMPLETED"}}, select)
              .populate("division_id", "_id name").sort({invoice_date: "desc"});
      query.exec((err, Bills) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Bills);
        }
      });
    },
    function (callback) { // Fetch transactions by the customer
      const select = "type category_name transaction_type transaction_date transaction_amount division_id ledger_id memo";

      const query = AccounttransModel.find({payee_id: req.params.id, is_deleted: false}, select).populate("division_id", "_id name")
        .populate("ledger_id", "_id name").sort({transaction_date: "desc"});
      query.exec((err, Trans) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Trans);
        }
      });
    },
    function (callback) { // Fetch transactions by the customer
      const select = "customer_name opening_balance";

      const query = CustomerModel.findOne({_id: req.params.id}, select).populate("opening_balance", "total_balance pending_balance due_status");
      query.exec((err, Trans) => {
        if (err) {
          callback(err);
        } else {
          callback(null, Trans);
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

    const filterData = {};
    filterData.Billdetails = results[0] || [];
    filterData.Transactiondetails = results[1] || [];
    filterData.Openingbalancedetails = results[2] || [];

    return res.send({success: true, data: filterData});
  });
});

module.exports = router;
