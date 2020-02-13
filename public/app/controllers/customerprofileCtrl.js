/* global _ */
/* global angular */
angular.module("customerprofileCtrl", []).controller("CustomerprofileController", ($scope, $rootScope, $anchorScroll, Notification,
  CustomerService, $timeout, commonobjectService,
  DeliveryService, InvoiceService, $filter, $q, $sce) => { // Customer ctrl
  $scope.data = {};
  $scope.data.paymentcardToggle = false;
  $scope.data.limit = 35;

  $scope.customerForm = {};
  $scope.customerdata = {};

  $scope.customerdata.viewableCustomerData = {};
  $scope.customerdata.processfilters = [];
  $scope.customerdata.Billdetails = [];
  $scope.customerdata.Transactiondetails = [];
  $scope.customerdata.Customergroupdetails = {};
  $scope.customerdata.Totalorder = 0;
  $scope.customerdata.Totalreceived = 0;
  $scope.customerdata.Totalpending = 0;
  $scope.customerdata.Totalspend = 0;

  $scope.customerdata.disablescroll = false;
  $scope.customerdata.pageLoader = true;

  $scope.commonobjectService = commonobjectService;
  $scope.data.currency = commonobjectService.getCurrency();

  const chartlabel = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  $scope.arealabels = [];
  $scope.areaseries = ["Order", "Invoice"];
  $scope.areadata = [];

  $scope.labels2 = ["New Order", "In Progress", "Completed", "Delivered"];
  $scope.data2 = [5, 2, 15, 22];

  // Customer Discount group calculation
  $scope.discountCalculation = function (measurement, discountBy) {
    if (angular.isUndefined(measurement.cost) || isNaN(measurement.cost) || parseFloat(measurement.cost) === 0) {
      measurement.discount_price = "0.00";
      measurement.discount_percentage = "0.00";
      return true;
    }

    if (angular.isDefined(measurement.cost) && !isNaN(measurement.cost)) {
      if (angular.isDefined(discountBy) && discountBy === "PAGE" && isNaN(measurement.discount_price)) {
        const cost = parseFloat(measurement.cost);
        measurement.discount_price = cost.toFixed(2);
      }
      if (angular.isDefined(discountBy) && discountBy === "PRICE" && isNaN(measurement.discount_percentage)) {
        measurement.discount_percentage = "0.00";
      }
    }

    if (angular.isDefined(measurement.discount_price) && !isNaN(measurement.discount_price)) {
      const discount = parseFloat(measurement.discount_price);
      measurement.discount_price = discount.toFixed(2);
    }
    if (angular.isDefined(measurement.discount_percentage) && !isNaN(measurement.discount_percentage)) {
      const discountpercentage = parseFloat(measurement.discount_percentage);
      measurement.discount_percentage = discountpercentage.toFixed(2);
    }

    if (angular.isDefined(discountBy) && discountBy === "PAGE") {
      const afterDiscountAmount = parseFloat(measurement.discount_price);
      const wholeAmount = parseFloat(measurement.cost);
      const page = (parseFloat(afterDiscountAmount) * 100) / parseFloat(wholeAmount);
      const calc1 = parseFloat(100) - parseFloat(page);
      measurement.discount_percentage = calc1.toFixed(2);
    }

    if (angular.isDefined(discountBy) && discountBy === "PRICE") {
      const wholeAmount2 = parseFloat(measurement.cost);
      const price2 = (parseFloat(wholeAmount2) * parseFloat(measurement.discount_percentage)) / 100;
      const calc2 = parseFloat(wholeAmount2) - parseFloat(price2);
      measurement.discount_price = calc2.toFixed(2);
    }
  };

  // View invoice data
  $scope.viewInvoice = function (invoice) {
    invoice.viewInvoice = !invoice.viewInvoice;
    if (invoice.viewInvoice && angular.isDefined(invoice) && invoice !== null && invoice._id) {
      invoice.invoiceloader = true;
      invoice.invoiceexist = false;
      InvoiceService.viewcustomerInvoice(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && result !== "" && angular.isDefined(result._id)) {
          invoice.viewinvoiceData = angular.copy(result);
          invoice.invoiceexist = true;
        }
        invoice.invoiceloader = false;
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
        invoice.invoiceloader = false;
      });
    }
  };

  $scope.formatDiscounts = function (divisionData) {
    if (angular.isDefined($scope.customerdata.Customergroupdetails.group_discount) &&
        $scope.customerdata.Customergroupdetails.group_discount !== null &&
        $scope.customerdata.Customergroupdetails.group_discount.length > 0) {
      $scope.customerdata.Customergroupdetails.discountview = [];

      angular.forEach(divisionData, (division) => {
        if (angular.isDefined(division.name) && angular.isDefined(division._id)) {
          angular.forEach($scope.customerdata.processfilters, (process) => {
            if (angular.isDefined(process.division_id) && process.division_id === division._id) {
              const obj = {};
              obj.process_name = process.process_name;
              obj.division_name = division.name;
              obj.measurements = [];
              let proceedindex = 0;

              angular.forEach($scope.customerdata.Customergroupdetails.group_discount, (grp, grpindex) => {
                if (angular.isDefined(grp.division_id) && angular.isDefined(grp.process_id) && angular.isDefined(grp.measurement_id) &&
                                        angular.isDefined(grp.discount_price) && grp.division_id === division._id && process._id === grp.process_id &&
                                        process.division_id === grp.division_id) {
                  angular.forEach($scope.customerdata.Measurements, (measurement) => {
                    if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure) &&
                                                measurement._id === grp.measurement_id) {
                      const objs = {};
                      objs.cost = 0.00;
                      if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                        objs.cost = $filter("getProcesscostFilter")(process.measurement, grp.measurement_id);
                      }
                      objs.measurement_id = grp.measurement_id;
                      objs.discount_price = grp.discount_price;
                      objs.percentage = 0.00;

                      $scope.discountCalculation(objs, "PAGE");
                      obj.measurements.push(objs);
                    }
                  });
                }
                if (grpindex === $scope.customerdata.Customergroupdetails.group_discount.length - 1) {
                  proceedindex = 1;
                  if (obj.measurements.length === 0) {
                    angular.forEach($scope.customerdata.Measurements, (measurement) => {
                      if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                        const objs = {};
                        objs.cost = 0.00;
                        if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                          objs.cost = $filter("getProcesscostFilter")(process.measurement, measurement._id);
                        }
                        objs.measurement_id = measurement._id;
                        objs.discount_price = 0.00;
                        objs.percentage = 0.00;

                        $scope.discountCalculation(objs, "PAGE");
                        obj.measurements.push(objs);
                      }
                    });
                  }
                }
              });
              if (proceedindex > 0 && obj.measurements.length > 0) {
                obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                $scope.customerdata.Customergroupdetails.discountview.push(obj);
              }
            }
          });
        }
      });
    } else {
      $scope.customerdata.Customergroupdetails.discountview = [];

      angular.forEach(divisionData, (division) => {
        if (angular.isDefined(division.name) && angular.isDefined(division._id)) {
          angular.forEach($scope.customerdata.processfilters, (process) => {
            if (angular.isDefined(process._id) && angular.isDefined(process.division_id) && division._id === process.division_id) {
              const obj = {};
              obj.process_name = process.process_name;
              obj.process_id = process._id;
              obj.division_name = division.name;
              obj.division_id = division._id;
              obj.measurements = [];
              angular.forEach($scope.customerdata.Measurements, (measurement, measureindex) => {
                if (angular.isDefined(measurement._id) && angular.isDefined(measurement.fabric_measure)) {
                  const objs = {};
                  objs.cost = 0.00;
                  if (angular.isDefined(process.measurement) && process.measurement !== null && process.measurement.length > 0) {
                    objs.cost = $filter("getProcesscostFilter")(process.measurement, measurement._id);
                  }
                  objs.measurement_id = measurement._id;
                  objs.discount_price = 0.00;
                  objs.percentage = 0.00;
                  $scope.discountCalculation(objs, "PAGE");
                  obj.measurements.push(objs);
                }
                if (measureindex === $scope.customerdata.Measurements.length - 1) {
                  obj.measurements = $filter("orderBy")(obj.measurements, "measurement_id");
                  $scope.customerdata.Customergroupdetails.discountview.push(obj);
                }
              });
            }
          });
        }
      });
    }
  };

  function calculateBilltotal() {
    const deferred = $q.defer();
    let count = 0;
    angular.forEach($scope.customerdata.Billdetails, (bills) => {
      if (angular.isDefined(bills.total) && bills.total !== null && bills.total !== "" && parseFloat(bills.total) > 0) {
        $scope.customerdata.Totalorder += parseFloat(bills.total);
        $scope.customerdata.Totalpending += parseFloat(bills.total);
      }
      count += 1;
    });
    if (count === $scope.customerdata.Billdetails.length) {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function calculateTransactiontotal() {
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (angular.isDefined(trans.transaction_amount) && trans.transaction_amount !== null && trans.transaction_amount !== "" &&
        parseFloat(trans.transaction_amount) > 0) {
        if (angular.isDefined(trans.transaction_type) && trans.transaction_type === "DEDIT") {
          $scope.customerdata.Totalspend += parseFloat(trans.transaction_amount);
        } else {
          $scope.customerdata.Totalreceived += parseFloat(trans.transaction_amount);
          $scope.customerdata.Totalpending -= parseFloat(trans.transaction_amount);
        }
      }
    });
  }

  $scope.assignInvoicetransaction = function () {
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (angular.isDefined(trans.bills) && trans.bills !== null && trans.bills.length > 0) {
        angular.forEach(trans.bills, (bills) => {
          if (angular.isDefined(bills.bill_id) && bills.bill_id !== null) {
            angular.forEach($scope.customerdata.Billdetails, (invoice) => {
              if (angular.isDefined(invoice._id) && invoice._id !== null && invoice._id !== "" && invoice._id === bills.bill_id) {
                if (angular.isUndefined(invoice.transactions)) {
                  invoice.transactions = [];
                }
                const obj = {};
                obj.transaction_date = angular.copy(trans.transaction_date);
                obj.transaction_amount = angular.copy(trans.transaction_amount);
                obj.transaction_id = angular.copy(trans._id);
                obj.allocated_amount = angular.copy(bills.amount_allocated);
                obj.balance_due = angular.copy(bills.balance_due);

                invoice.transactions.push(angular.copy(obj));
              }
            });
          }
        });
      }
    });
  };

  function setDeliverydetail(deliveryData, type) {
    angular.forEach(deliveryData, (data) => {
      if (angular.isDefined(data) && data !== null && angular.isDefined(data._id)) {
        const obj = {};
        obj._id = data._id;
        obj.order_id = data.order_id;
        obj.customer_name = data.customer_name;
        obj.order_no = data.order_no;
        obj.order_date = data.order_date;
        if (type === "DELIVERY") {
          obj.order_status = data.order_status;
        }
        obj.delivery_no = data.delivery_no;
        obj.delivery_date = data.delivery_date;

        obj.process = [];
        angular.forEach(data.outward_data, (owd) => {
          if (angular.isDefined(owd.process) && owd.process !== null && owd.process.length > 0) {
            angular.forEach(owd.process, (pro) => {
              if (angular.isDefined(pro.process_id) && angular.isDefined(pro.process_name)) {
                obj.process.push(pro);
              }
            });
          }
        });
        if (type === "DELIVERY") {
          $scope.customerdata.delivery.push(angular.copy(obj));
        } else {
          $scope.customerdata.deliveryReturn.push(angular.copy(obj));
        }
      }
    });
  }

  function invoicegraph(trans) {
    const deferred = $q.defer();
    let count = 0;
    let val = 0;
    const data = [];
    if (angular.isDefined(trans) && trans !== null && trans.length > 0) {
      angular.forEach($scope.labelsno, (lbno) => {
        let exist = false;
        angular.forEach(trans, (inv, ind) => {
          if (inv.month === lbno + 1) {
            val = inv.count;
            exist = true;
          }
          if (ind === trans.length - 1) {
            if (!exist) {
              val = 0;
            }

            data.push(val);
            count += 1;
          }
        });
      });
    } else {
      angular.forEach($scope.labelsno, () => {
        data.push(val);
        count += 1;
      });
    }

    if (count === $scope.labelsno.length) {
      deferred.resolve(data);
    }
    return deferred.promise;
  }

  // User Action --->View
  $scope.view = function () {
    $scope.customerdata.currentUserCustomerGroup = {};
    $scope.customerdata.viewmenu = "Profile";

    $scope.arealabels = [];
    $scope.labelsno = [];
    const a = [];
    const b = [];
    $scope.areadata = [a, b];

    $scope.customerdata.delivery = [];
    $scope.customerdata.skipdelivery = [];
    $scope.customerdata.deliveryReturn = [];
    $scope.customerdata.skipdeliveryReturn = [];

    CustomerService.viewhistory((data) => {
      if (angular.isDefined(data) && data !== null && angular.isDefined(data.success)) {
        if (data.success) {
          if (angular.isDefined(data.data) && data.data !== null && angular.isDefined(data.data.Customerdetails) &&
            data.data.Customerdetails !== null && angular.isDefined(data.data.Customerdetails._id)) {
            if (angular.isDefined(data.data.filterdates)) {
              let startmnth = data.data.filterdates;
              for (let i = 0; i < 6; i += 1) {
                $scope.labelsno.push(startmnth);
                $scope.arealabels.push(chartlabel[startmnth]);
                if (startmnth === 11) {
                  startmnth = 0;
                } else {
                  startmnth += 1;
                }
              }
            }

            invoicegraph(data.data.orders).then((ordergraphdata) => {
              if (angular.isDefined(ordergraphdata) && ordergraphdata !== null && ordergraphdata.length > 0) {
                $scope.areadata[0] = ordergraphdata;
              }
            });

            invoicegraph(data.data.transaction).then((invoicegraphdata) => {
              if (angular.isDefined(invoicegraphdata) && invoicegraphdata !== null && invoicegraphdata.length > 0) {
                $scope.areadata[1] = invoicegraphdata;
              }
            });

            $scope.customerdata.processfilters = (angular.isDefined(data.data.Processdetail) && data.data.Processdetail !== null &&
                data.data.Processdetail.length > 0) ? angular.copy(data.data.Processdetail) : [];
            $scope.customerdata.viewableCustomerData = angular.copy(data.data.Customerdetails);
            $scope.customerdata.Measurements = (angular.isDefined(data.data.Measurements) && data.data.Measurements !== null &&
                data.data.Measurements.length > 0) ? angular.copy(data.data.Measurements) : [];
            $scope.customerdata.Customergroupdetails = (angular.isDefined(data.data.Customergroupdetails) &&
                data.data.Customergroupdetails !== null) ? angular.copy(data.data.Customergroupdetails) : "";
            $scope.customerdata.Billdetails = (angular.isDefined(data.data.Billdetails) && data.data.Billdetails !== null &&
                data.data.Billdetails.length > 0) ? angular.copy(data.data.Billdetails) : [];
            $scope.customerdata.Transactiondetails = (angular.isDefined(data.data.Transactiondetails) && data.data.Transactiondetails !== null &&
                data.data.Transactiondetails.length > 0) ? angular.copy(data.data.Transactiondetails) : [];

            if (angular.isDefined(data.data.Delivery) && data.data.Delivery !== null && data.data.Delivery.length > 0) {
              setDeliverydetail(data.data.Delivery, "DELIVERY");
            }
            if (angular.isDefined(data.data.Deliveryreturn) && data.data.Deliveryreturn !== null && data.data.Deliveryreturn.length > 0) {
              setDeliverydetail(data.data.Deliveryreturn, "RETURN");
            }

            $scope.assignInvoicetransaction();

            calculateBilltotal().then((billTot) => {
              if (billTot) {
                calculateTransactiontotal();
              }
            });

            if ($scope.customerdata.Customergroupdetails !== null && $scope.customerdata.Customergroupdetails !== "" &&
                angular.isDefined($scope.customerdata.Customergroupdetails._id)) {
              if (angular.isDefined(data.data.Divisions) && data.data.Divisions !== null && data.data.Divisions.length > 0 &&
                $scope.customerdata.Measurements.length > 0 &&
                angular.isDefined($scope.customerdata.processfilters) && $scope.customerdata.processfilters.length > 0) {
                $scope.customerdata.Measurements = $filter("orderBy")($scope.customerdata.Measurements, "_id");
                if (angular.isDefined($scope.customerdata.Customergroupdetails.name) &&
                    angular.isDefined($scope.customerdata.viewableCustomerData.group) &&
                    $scope.customerdata.viewableCustomerData.group !== null &&
                    $scope.customerdata.viewableCustomerData.group === $scope.customerdata.Customergroupdetails._id) {
                  $scope.customerdata.assignedDiscountGroupName = angular.copy($scope.customerdata.Customergroupdetails.name);
                }
                $scope.formatDiscounts(data.data.Divisions);
              }
            }
          }
        } else {
          Notification.error(data.message);
        }
      }
      $scope.customerdata.pageLoader = false;
    }, (error) => {
      if (error !== null && angular.isDefined(error.message)) {
        Notification.error(error.message);
      }
      $scope.customerdata.pageLoader = false;
    });
  };

  $scope.view();


  $scope.getOrderno = function (invoiceItem, type) {
    const orderlist = _.uniq(_.flatten(_.pluck(invoiceItem, "order_no")));
    if (type === "ORDERNO") {
      return orderlist[0];
    }
    if (orderlist.length > 1) {
      return orderlist.length - 1;
    }
    return "";
  };

  $scope.paymentcardOpen = function (transaction) { // Payment Toggle Open
    angular.forEach($scope.customerdata.Transactiondetails, (trans) => {
      if (transaction === trans) {
        trans.paymentcardToggle = !trans.paymentcardToggle;
      } else {
        trans.paymentcardToggle = false;
      }
    });
    $scope.data.paymentcardToggle = true;
  };

  $scope.paymentcardClose = function (transaction) { // Payment Toggle Close
    transaction.paymentcardToggle = false;
  };

  $scope.customerHightlightshow = function (transData) {
    if (angular.isUndefined(transData) || transData.length === 0) {
      return false;
    }
    let showMenu = false;
    let count = 0;
    angular.forEach(transData, (trs) => {
      if (angular.isDefined(trs.transaction_id) && trs.transaction_id !== "") {
        showMenu = true;
      }
      count += 1;
    });
    if (count === transData.length) {
      return showMenu;
    }
  };

  function setTranshighlight() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Transactiondetails) && $scope.customerdata.Transactiondetails !== null &&
        $scope.customerdata.Transactiondetails.length > 0) {
      angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
        allbil.hightlighttrans = false;
        allbil.paymentcardToggle = false;
        allbil.showbill = false;
        if (allkey === $scope.customerdata.Transactiondetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function Transresethighlight(index) {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Transactiondetails) && $scope.customerdata.Transactiondetails !== null &&
        $scope.customerdata.Transactiondetails.length > 0) {
      angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.transaction_type) && (allbil.transaction_type === "CREDIT" || allbil.transaction_type === "DEBIT")
                        && angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
        }
        if (index !== allkey) {
          allbil.paymentcardToggle = false;
        }
        allbil.showbill = false;
        if (allkey === $scope.customerdata.Transactiondetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function setBillhighlight(index) {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Billdetails) && $scope.customerdata.Billdetails !== null &&
        $scope.customerdata.Billdetails.length > 0) {
      angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
        }
        if (index !== allkey) {
          allbil.viewInvoice = false;
        }
        allbil.showhighlight = false;
        if (allkey === $scope.customerdata.Billdetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  function Billresethighlight() {
    const deferred = $q.defer();
    if (angular.isDefined($scope.customerdata.Billdetails) && $scope.customerdata.Billdetails !== null &&
        $scope.customerdata.Billdetails.length > 0) {
      angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
        if (angular.isDefined(allbil.hightlighttrans)) {
          allbil.hightlighttrans = false;
          allbil.viewInvoice = false;
        }
        allbil.showhighlight = false;
        if (allkey === $scope.customerdata.Billdetails.length - 1) {
          deferred.resolve(true);
        }
      });
    } else {
      deferred.resolve(true);
    }
    return deferred.promise;
  }

  $scope.highlightTransaction = function (trans) {
    const index = $scope.customerdata.Billdetails.indexOf(trans);
    setTranshighlight().then((trns) => {
      if (trns !== null && trns) {
        setBillhighlight(index).then((bil) => {
          if (bil !== null && bil && angular.isDefined(trans.transactions)) {
            angular.forEach(trans.transactions, (trs) => {
              if (angular.isDefined(trs.transaction_id)) {
                angular.forEach($scope.customerdata.Transactiondetails, (allbil) => {
                  if (angular.isDefined(allbil.transaction_type) && (allbil.transaction_type === "CREDIT" ||
                    allbil.transaction_type === "DEBIT") && trs.transaction_id === allbil._id) {
                    trans.showhighlight = true;
                    allbil.hightlighttrans = true;
                    trans.hightlighttrans = true;
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  $scope.highlightBills = function (trans) {
    const index = $scope.customerdata.Transactiondetails.indexOf(trans);
    Billresethighlight().then((bil) => {
      if (bil !== null && bil) {
        Transresethighlight(index).then((trns) => {
          if (trns !== null && trns && angular.isDefined(trans.bills)) {
            angular.forEach(trans.bills, (trs) => {
              if (angular.isDefined(trs.bill_no)) {
                angular.forEach($scope.customerdata.Billdetails, (allbil) => {
                  if (angular.isDefined(allbil._id) && trs.bill_id === allbil._id) {
                    trans.showbill = true;
                    allbil.hightlighttrans = true;
                    trans.hightlighttrans = true;
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  $scope.restoreBills = function (trans) {
    const index = $scope.customerdata.Transactiondetails.indexOf(trans);
    angular.forEach($scope.customerdata.Billdetails, (allbil) => {
      allbil.hightlighttrans = false;
      allbil.viewInvoice = false;
    });
    angular.forEach($scope.customerdata.Transactiondetails, (allbil, allkey) => {
      allbil.hightlighttrans = false;
      if (index !== allkey) {
        allbil.paymentcardToggle = false;
      }
      allbil.showbill = false;
    });
    trans.showbill = false;
  };

  $scope.restoreTransaction = function (trans) {
    const index = $scope.customerdata.Billdetails.indexOf(trans);
    angular.forEach($scope.customerdata.Transactiondetails, (allbil) => {
      allbil.hightlighttrans = false;
      allbil.paymentcardToggle = false;
      trans.showhighlight = false;
    });
    angular.forEach($scope.customerdata.Billdetails, (allbil, allkey) => {
      allbil.hightlighttrans = false;
      if (index !== allkey) {
        allbil.viewInvoice = false;
      }
    });
    trans.showhighlight = false;
  };

  $scope.printThisinvoice = function (invoice) {
    if (angular.isDefined(invoice) && invoice !== null && angular.isDefined(invoice._id)) {
      InvoiceService.printInvoicedata(invoice._id, (result) => {
        if (angular.isDefined(result) && result !== null && angular.isDefined(result.data) && result.data !== null &&
            angular.isDefined(result.data.Invoicedata) && result.data.Invoicedata !== null && angular.isDefined(result.data.Invoicedata._id)) {
          const templateUrl = $sce.getTrustedResourceUrl("app/views/common/invoice_print.html");
          invoiceDetail = result.data;
          currency = $scope.data.currency;
          window.open(templateUrl, "_blank");
        } else {
          Notification.error("Invoice not found.");
        }
      }, (error) => {
        if (error !== null && angular.isDefined(error.message)) {
          Notification.error(error.message);
        }
      });
    }
  };
});
