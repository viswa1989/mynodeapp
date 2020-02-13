const errorhelper = require("../../../../app/helpers/errorhelper");
const commonfunction = require("../../../../app/middlewares/commonfunction");
const mongoose = require("mongoose");
const async = require("async");
const express = require("express");

const router = express.Router();
const CustomerModel = require("../../../../app/models/CustomersModel");
const BillModel = require("../../../../app/models/BillModel");
const AccounttransModel = require("../../../../app/models/AccounttransactionModel");
const AccountledgerModel = require("../../../../app/models/AccountledgerModel");
const _ = require('underscore');
const excel = require("exceljs");
const CustomeropeningbalModel = require("../../../../app/models/CustomeropeningbalancesModel");
const PreferenceModel = require("../../../../app/models/PreferenceModel");

function Pendingpaymentreport(billDetails, callbackdt) {
  async.mapSeries(billDetails, (billLoop, calback) => {
    const cusid = mongoose.Types.ObjectId(billLoop.customer_id);
    
    const matchdata = {$match: {customer_id: cusid, payment_status: {$ne: "COMPLETED"}, is_deleted: false}};
    
    const group = {$group: {_id: {customer_id: "$customer_id", division_id: "$division_id"},
      invoice_count: {$sum: 1},
      division_name: { $first: "$division.name" },
      pending_amount: {$sum: {$subtract: ["$total", "$paid"]}},
      invoice_amount: {$sum: "$total"}}};
      
    const group1 = {$group: {_id: "$_id.customer_id",
      total_pendinginvoice: {$sum: "$invoice_count"},
      total_pendingamount: {$sum: "$pending_amount"},
      total_invoiceamount: {$sum: "$invoice_amount"},
      pending_detail: {$push: {division_id: "$_id.division_id",
        division_name: "$division_name",
        invoice_count: "$invoice_count",
        pending_amount: "$pending_amount"}}}};
        
    const lookup = {$lookup: {from: "divisions", localField: "division_id", foreignField: "_id", as: "division"}};

    BillModel.aggregate(matchdata, lookup, {$unwind: "$division"}, group, group1, (eer, bills) => {
      if (eer) {
        calback(eer, null);
      } else {
        let BillDetail = bills;
        if ((BillDetail && BillDetail !== null && BillDetail.length>0) || 
                (billLoop.due_status && billLoop.due_status !== null)) {
         if(!BillDetail || BillDetail === null || BillDetail.length === 0) {
           BillDetail = [];
           const bobj = {};
           bobj._id = billLoop.customer_id;
           bobj.total_pendinginvoice = 0;
           bobj.total_pendingamount = 0;
           bobj.total_invoiceamount = 0;
           bobj.pending_detail = [];
           BillDetail.push(bobj);
         }
        async.mapSeries(BillDetail, (customer, callback) => {
          const customerData = {};
          customerData._id = customer._id;
          customerData.total_pendinginvoice = customer.total_pendinginvoice;
          customerData.total_pendingamount = customer.total_pendingamount;
          customerData.total_invoiceamount = customer.total_invoiceamount;
          customerData.pending_detail = customer.pending_detail;
          customerData.name = "";
          customerData.mobile_no = "";
          customerData.total_paidbill = 0;
          customerData.pending_detail = customer.pending_detail;
          customerData.paidinvoice_total = customer.paidinvoice_total;
          customerData.payment_received = 0;
          customerData.address = {};

          const id = mongoose.Types.ObjectId(customer._id);
          const ob = {};
          async.parallel([
            function (cb) { // Fetch branch account details by branch id
              CustomerModel.findOne({_id: id}, { address: { $elemMatch: { is_default: true } }, name: 1, mobile_no: 1}, (er, cus) => {
                if (er) {
                  cb(er, null);
                } else if (cus && cus !== null && cus._id) {
                  cb(null, cus);
                } else {
                  cb(null, {});
                }
              });
            },
            function (cb) { // Fetch branch account details by branch id
              const matchBill = {$match: {customer_id: id, payment_status: "COMPLETED", is_deleted: false}};
              const groupBill = {$group: {_id: "$customer_id", paidinvoice_total: {$sum: "$total"}}};
              BillModel.aggregate(matchBill, groupBill, (er, billData) => {
                if (er) {
                  cb(er, null);
                } else if (billData && billData !== null && billData.length > 0) {
                  cb(null, billData[0]);
                } else {
                  cb(null, ob);
                }
              });
            },
            function (cb) { // Fetch bills for the customer
              const matchData = {$match: {payee_id: id, is_deleted: false, transaction_type: "CREDIT"}};
              const groupData = {$group: {_id: "$payee_id", total_transaction: {$sum: "$transaction_amount"}}};
              AccounttransModel.aggregate(matchData, groupData, (errd, trans) => {
                if (errd) {
                  next(errd); // TODO handle error
                } else if (trans && trans !== null && trans.length > 0) {
                  cb(null, trans[0]);
                } else {
                  cb(null, ob);
                }
              });
            },
            function (cb) { // Fetch bills for the customer
              const conditions = {customer_id: id, is_deleted: false, due_status:"Open"};
              CustomeropeningbalModel.findOne(conditions,"customer_id pending_balance total_balance", (errd, baldt) => {
                if (errd) {
                  next(errd); // TODO handle error
                } else if (baldt && baldt !== null && baldt._id) {
                  cb(null, baldt);
                } else {
                  cb(null, ob);
                }
              });
            },
          ], (errs, result) => { // Compute all results
            if (errs) {
              callback(errs, null);
            }
            if (result && result !== null) {
              if (result[0] && result[0] !== null && result[0]._id) {
                if (result[0].name) {
                  customerData.name = result[0].name;
                }
                if (result[0].mobile_no) {
                  customerData.mobile_no = result[0].mobile_no;
                }
                if (result[0].address && result[0].address !== null && result[0].address.length > 0) {
                  customerData.address = result[0].address[0];
                }
              }
              if (result[1] && result[1] !== null && result[1]._id) {
                customerData.paidinvoice_total = result[1].paidinvoice_total;
              }
              if (result[2] && result[2] !== null && result[2]._id) {
                customerData.payment_received = result[2].total_transaction;
              }
              if (result[3] && result[3] !== null && result[3].total_balance && parseFloat(result[3].total_balance) !== 0 && result[3].pending_balance) {
                if(parseFloat(result[3].total_balance)>0){
                  customerData.previous_balance = result[3].pending_balance;
                  customerData.total_pendingamount += result[3].pending_balance;
                }
                if(parseFloat(result[3].total_balance)<0){
                  customerData.previous_owe = -1 * result[3].pending_balance;
                  if(customerData.total_pendingamount < customerData.previous_owe) {
                    customerData.excess_payment = customerData.previous_owe - customerData.total_pendingamount;
                  }
                }
              }
              callback(null, customerData);
            } else {
              callback(null, customerData);
            }
          });
        }, (err, results) => {
          if (err) {
            calback(err, null);
          } else {
            calback(null, results[0]);
          }
        });
        } else {
          calback(null, bills);
        }
      }
    });
  }, (ed, resultData) => {
    if (ed) {
      callbackdt(ed);
      return;
    } else {
      return callbackdt(null, resultData);
    }
  });
}

function formatcustomerid(cusID, callbackdt) {
   let customerIds = [];
   async.forEachSeries(cusID, (cus, calbk) => {
     if(cus.customer_id && cus.customer_id !== null && cus.customer_id !=="") {
       let obid = mongoose.Types.ObjectId(cus.customer_id);
       customerIds.push(obid);
       calbk(null);
     } else {
       calbk(null);  
     }
   }, (ed, resultData) => {
    if (ed) {
      callbackdt(ed);
      return;
    } else {
      return callbackdt(null, customerIds);
    }
  });
}

// Pending payment reports
router.post("/getPendingpayment", (req, res) => {
  const obj = {};
  obj.payment_status = {$ne: "COMPLETED"};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  obj.is_deleted = false;
  const match = {$match: obj};
  const groupin = {$group: {_id: {customer_id: "$customer_id"}, customer_id: { $first: "$customer_id" }}};
  BillModel.aggregate(match, groupin, (erss, billDetails) => {
    if (erss) {
      res.status(499).send({message: errorhelper.getErrorMessage(erss)});
    } else if (billDetails && billDetails !== null && billDetails.length > 0) {
      let pendingDetails = [];
      
      if (billDetails && billDetails !== null && billDetails.length > 0) {
        pendingDetails = billDetails;
      }
      formatcustomerid(billDetails, (errs, customerID) => {
        CustomeropeningbalModel.find({customer_id:{$nin: customerID}, due_status:"Open", total_balance:{$gt: 0}},"customer_id due_status", (erdt, openbal) => {
          if (erdt) {
            res.status(499).send({ message: errorhelper.getErrorMessage(erdt) });
            return;
          } else {
            pendingDetails = pendingDetails.concat(openbal);
            Pendingpaymentreport(pendingDetails, (errs, reportData) => {
              if (errs) {
                res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                return;
              } else {
                return res.json({data: reportData});
              }
            });
          }
        });
      });
    } else {
      let pendingDetails = [];
      if (billDetails && billDetails !== null && billDetails.length > 0) {
        pendingDetails = billDetails;
      }
      return res.send({data: billDetails});
    }
  });
});

// Ageing reports
router.post("/getAgeing", (req, res) => {
  const obj = {};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  let select = "name division_id mobile_no opening_balance";
  let openingbal = "total_balance total_allocated pending_balance due_status";
  let pendingpref = [ '0','30','60','90','120','150','180'];
  
  CustomerModel.find(obj, select).populate("opening_balance", openingbal).exec((erdt, cus) => {
    if (erdt) {
      res.status(499).send({message: errorhelper.getErrorMessage(erdt)});
    } else {
      PreferenceModel.findOne({ module: "Dashboard", preference: "Pending Dues", is_deleted: false }, "value", (err, preference) => {
        if (err) {
          callback(err);
        } else {
          let customerDetails = [];
          if (preference.value && preference.value !== null && preference.value !== "") {
            let prefvalue = preference.value.split(",");
            if (prefvalue && prefvalue !== null && prefvalue.length>0) {
              pendingpref = prefvalue;
            }
          }
          
          const dueParam = commonfunction.filterparamageing(pendingpref);
          
          async.mapSeries(cus, (cusdata, callback) => {
            let objdata = {};
            objdata.division_id = cusdata.division_id;
            objdata.mobile_no = cusdata.mobile_no;
            objdata.customer_id = mongoose.Types.ObjectId(cusdata._id);
            objdata.customer_name = cusdata.name;

            if (cusdata.opening_balance && cusdata.opening_balance !== null && cusdata.opening_balance._id && cusdata.opening_balance.due_status && 
                    cusdata.opening_balance.due_status === "Open" && cusdata.opening_balance.total_balance && parseFloat(cusdata.opening_balance.total_balance)>0) {
              objdata.openingBalance = parseFloat(cusdata.opening_balance.pending_balance);
            } else {
              objdata.openingBalance = 0;
            }
            objdata.totalBalance = objdata.openingBalance;
            
            if (dueParam !== null && dueParam.length>0) {
              async.forEachSeries(dueParam, (dues, calbk) => {

                req.filters = commonfunction.filterBydateageing(dues.dueFrom, dues.dueTo);
                const objs = {};
                if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
                  objs.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
                } else if (req.session && req.session.role && req.session.role > 1) {
                  objs.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
                }
                objs.payment_status = {$ne: "COMPLETED"};
                objs.customer_id = cusdata._id;
                objs.is_deleted = false;
                if (dues.dueFrom !== dues.dueTo) {
                  objs.invoicedue_date = {$gt: req.filters.startDate, $lte: req.filters.endDate};
                } else {
                  objs.invoicedue_date = {$lte: req.filters.endDate};
                }

                const match = {$match: objs};

                const groupin = {$group: {_id: "$customer_id",invoicedue_date: { $first: "$invoicedue_date" }, invoice_balance: {$sum: {$subtract: ["$total", "$paid"]}}}};
                const proj1 = { $project: {"customer_id":1, "invoicedue_date":1} };

                BillModel.aggregate(match, groupin, (erss, billDetails) => {
                  if (erss) {
                    calbk(erss);
                  } else if (billDetails && billDetails !== null && billDetails.length > 0) {
                    objdata[dues.title] = billDetails[0].invoice_balance;
                    objdata.totalBalance += billDetails[0].invoice_balance;
                    calbk(null);
                  } else {
                    objdata[dues.title] = 0;
                    calbk(null);
                  }
                });
                  
              }, (ed, resultData) => {
                if (ed) {
                  callback(ed);
                } else {
                  if((objdata.totalBalance && objdata.totalBalance>0) || (objdata.openingBalance && objdata.openingBalance>0)) {
                    customerDetails.push(objdata);
                  }
                  callback(null);
                }
              });
            } else {
               callback(null); 
            }
  
          }, (errd, results) => {

            return res.send({data: customerDetails});
          });
        }
      });
    }
  });
});

function writePendingpaydata(pendingpayment, selectedDivision, divisionID, sheet1, callback) {
  let pendingdata = [];
  async.mapSeries(pendingpayment, (paydt, calbak) => {
    const ord = {};
    ord.division = selectedDivision;
    ord.customer_name = paydt.name;
    ord.pending_amt = 0;
    ord.totalpending_amt = paydt.total_pendingamount;
    if (paydt.previous_balance && paydt.previous_balance !== null && parseFloat(paydt.previous_balance)>0) {
      ord.ledger_balance = paydt.previous_balance;
    } else {
      ord.ledger_balance = "";
    }
    if (paydt.excess_payment && paydt.excess_payment !== null && parseFloat(paydt.excess_payment)>0) {
      ord.excess_payments = paydt.excess_payment;
    } else {
      ord.excess_payments = "";
    }
    if (paydt.previous_balance && paydt.previous_balance !== null && parseFloat(paydt.previous_balance)>0) {
      ord.ledger_balance = paydt.previous_balance;
    }
    if (paydt.pending_detail && paydt.pending_detail !== null && paydt.pending_detail.length>0) {
      if (divisionID && divisionID !== null) {
        _.map(paydt.pending_detail, function(pay) {
          if (pay.division_id.equals(divisionID)) {
            ord.pending_amt = pay.pending_amount;
          }
        });
      } else {
        ord.pending_amt = paydt.total_pendingamount;
      }
      
      sheet1.addRow(ord);
    } else {
      sheet1.addRow(ord);
    }
    if (paydt.pending_detail && paydt.pending_detail !== null && paydt.pending_detail.length>0) {
      
        async.forEachSeries(paydt.pending_detail, (billdt, calbk) => {        
          if (billdt && billdt !== null && billdt.division_id) {
            const billobj = {};
            billobj.division_name = billdt.division_name;
            billobj.pending_amt = `${billdt.invoice_count}    Pending Bills`;
            billobj.totalpending_amt = billdt.pending_amount;
            sheet1.addRow(billobj);
            calbk(null);
          } else {
            calbk(null);
          }
        }, (err, result) => {
            if (paydt.previous_balance && paydt.previous_balance !== null && parseFloat(paydt.previous_balance)>0){
                const bilobj = {};
                bilobj.pending_amt = "Pending Balance";
                bilobj.totalpending_amt = paydt.previous_balance;
                sheet1.addRow(bilobj);
            }
            const totbills = paydt.total_paidbill + paydt.total_pendinginvoice;
            sheet1.addRow({customer_name: `Paid Bills             ${paydt.total_paidbill}`});
            sheet1.addRow({customer_name: `Pending Bills     ${paydt.total_pendinginvoice}`});
            sheet1.addRow({customer_name: `Total Bills            ${totbills}`, 
                            division_name: "Total", totalpending_amt: paydt.total_pendingamount});
            calbak(null);
        });
    } else if (paydt.previous_balance && paydt.previous_balance !== null && parseFloat(paydt.previous_balance)>0){
      const billobj = {};
      billobj.pending_amt = "Pending Balance";
      billobj.totalpending_amt = paydt.previous_balance;
      sheet1.addRow(billobj);
      const totbills = paydt.total_paidbill + paydt.total_pendinginvoice;
      sheet1.addRow({customer_name: `Paid Bills             ${paydt.total_paidbill}`});
      sheet1.addRow({customer_name: `Pending Bills     ${paydt.total_pendinginvoice}`});
      sheet1.addRow({customer_name: `Total Bills            ${totbills}`, 
                    division_name: "Total", totalpending_amt: paydt.total_pendingamount});
      calbak(null);
    }
    
  }, (errd, results) => {
    callback(null, pendingdata);
  });
}

// Export Pending payment reports
router.post("/exportpendingpaystatement", (req, res) => {
  const obj = {};
  let selectedDivision = "";
  let divisionID = "";
  obj.payment_status = {$ne: "COMPLETED"};
  if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
    divisionID = mongoose.Types.ObjectId(req.body.filterData.division);
  } else if (req.session && req.session.role && req.session.role > 1) {
    obj.division_id = mongoose.Types.ObjectId(req.body.filterData.division);
    divisionID = mongoose.Types.ObjectId(req.body.filterData.division);
  }
  selectedDivision = req.body.filterData.divisionname;
  obj.is_deleted = false;
  const match = {$match: obj};
  const groupin = {$group: {_id: {customer_id: "$customer_id"}, customer_id: { $first: "$customer_id" }}};
  BillModel.aggregate(match, groupin, (erss, billDetails) => {
    if (erss) {
      res.status(499).send({message: errorhelper.getErrorMessage(erss)});
    } else if (billDetails && billDetails !== null && billDetails.length > 0) {
      let pendingDetails = [];
      
      if (billDetails && billDetails !== null && billDetails.length > 0) {
        pendingDetails = billDetails;
      }
      formatcustomerid(billDetails, (errs, customerID) => {
        CustomeropeningbalModel.find({customer_id:{$nin: customerID}, due_status:"Open", total_balance:{$gt: 0}},"customer_id due_status", (erdt, openbal) => {
          if (erdt) {
            res.status(499).send({ message: errorhelper.getErrorMessage(erdt) });
            return;
          } else {
            pendingDetails = pendingDetails.concat(openbal);
            Pendingpaymentreport(pendingDetails, (errs, reportData) => {
              if (errs) {
                res.status(499).send({ message: errorhelper.getErrorMessage(errs) });
                return;
              } else {
                let reportheader = "PENDING CUSTOMER PAYMENT";

                let workbook1 = new excel.Workbook();
                workbook1 = commonfunction.excelexportinfo(workbook1, req);

                let sheet1 = workbook1.addWorksheet('Sheet1');

                sheet1.mergeCells('A1', 'P2');
                sheet1.getCell('A1').value = reportheader;

                sheet1.getRow(3).values = commonfunction.excelpendingpaymentheader();
                sheet1.columns = commonfunction.excelpendingpaymentids();
                sheet1.getRow(1).font = {name: 'Calibri', 'size': 14, bold: true };

                sheet1.getRow(3).font = {name: 'Calibri', 'size': 12, bold: true };
                sheet1.getColumn(1).alignment = { vertical: 'justify' };
                sheet1.getColumn(2).alignment = { vertical: 'justify', horizontal: 'left' };
                sheet1.getColumn(3).alignment = { vertical: 'justify', horizontal: 'right' };
                sheet1.getColumn(4).alignment = { vertical: 'justify', horizontal: 'right' };
                sheet1.getColumn(5).alignment = { vertical: 'justify', horizontal: 'right' };
                sheet1.getColumn(6).alignment = { vertical: 'justify', horizontal: 'right' };
                sheet1.getColumn(7).alignment = { vertical: 'justify', horizontal: 'right' };
                sheet1.getColumn(4).numFmt = '0.00';
                sheet1.getColumn(5).numFmt = '0.00';
                sheet1.getColumn(6).numFmt = '0.00';
                sheet1.getColumn(7).numFmt = '0.00';
                sheet1.getCell('A1').alignment = { vertical: 'justify', horizontal: 'center' };

                let filename = `Pendingpaymentreport_${Date.now()}.xlsx`;
                const responsepath = `Uploads/export_files/${filename}`;
                const filePath = `./public/${responsepath}`;
                
                writePendingpaydata(reportData, selectedDivision, divisionID, sheet1, (err, orderData) => {
//                    sheet1.addRows(orderData);
                    workbook1.xlsx.writeFile(filePath).then(function(erdata) {
                      return res.send({success: true, data: responsepath});
                    });
                });
              }
            });
          }
        });
      });
    } else {
      let pendingDetails = [];
      if (billDetails && billDetails !== null && billDetails.length > 0) {
        pendingDetails = billDetails;
      }
      return res.send({data: billDetails});
    }
  });
});

// Division Accounts Statement
router.post("/getDivisionaccountstatement", (req, res) => {
    
    const division_id = mongoose.Types.ObjectId(req.body.filterData.division);
    req.filters = commonfunction.filterBydate(req.body.filterData.FromDate, req.body.filterData.ToDate);
  
    const condition = {is_deleted: false, is_active: true};
    if (req.body.filterData && req.body.filterData.division && req.body.filterData.division !== "") {
      condition.division_id = division_id;
    }
    const query = AccountledgerModel.find(condition, "_id name type opening_balance");
    let transsel = "category_name cheque_no division_id is_transfer ledger_balance ledger_id ledger_name memo ";
    transsel += "payee_name transaction_amount transaction_date transaction_type type bills.bill_no";
    let billsel = "bill_type customer_name division_id invoice_date invoice_no invoicedue_date total type";
    
    query.exec((errs, Accountledger) => {
      if (errs) {
        res.status(499).send({message: errorhelper.getErrorMessage(errs)});
        return;
      } else if (Accountledger && Accountledger !== null && Accountledger.length > 0 ){
        let accountledgerTrans = [];
        async.mapSeries(Accountledger, (ledger, cb) => {
          let ledData = JSON.parse(JSON.stringify(ledger));
          ledData.transaction = [];
          const obj = {};
          obj.division_id = division_id;
          obj.is_deleted = false;
          obj.ledger_id = ledger._id;
          
          if (ledger.type === "INVOICE") {
            obj.invoice_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};            
            BillModel.find(obj, billsel).sort({invoice_date: -1}).exec((err, Transaction) => {
                if (err) {
                  cb(err);
                } else {
                  ledData.transaction = JSON.parse(JSON.stringify(Transaction));
                  accountledgerTrans.push(ledData);
                  cb(null, Transaction);
                }
            });
          } else {
            obj.transaction_date = {$gte: req.filters.startDate, $lte: req.filters.endDate};
            AccounttransModel.find(obj, transsel).sort({transaction_date: -1}).exec((err, Transaction) => {
                if (err) {
                  cb(err);
                } else {
                  ledData.transaction = JSON.parse(JSON.stringify(Transaction));
                  accountledgerTrans.push(ledData);
                  cb(null, Transaction);
                }
            });              
          }
        }, (errd, results) => {
          if (errd) {
            res.status(499).send({message: errorhelper.getErrorMessage(err)});
            return;
          }
          return res.send({success: true, data: accountledgerTrans});
        });
      } else {
        return res.send({success: false, message: "Something went wrong please try again later!."});
      }
    });    
});

module.exports = router;